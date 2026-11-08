import java.io.IOException;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Durable, ordered queue of local writes. The UI enqueues and moves on; a sync job
 * drains it whenever the OS gives us time. Safe to kill at any line.
 */
public final class Outbox {
  /**
   * One pending local change. [id] is generated on the device and doubles as the
   * idempotency key, so a retried push is applied by the server at most once.
   */
  public record PendingOp(String entity, String payload, String id, int attempts) {
    public PendingOp(String entity, String payload) { this(entity, payload, UUID.randomUUID().toString(), 0); }

    PendingOp retried() { return new PendingOp(entity, payload, id, attempts + 1); }
  }

  public sealed interface PushResult permits Applied, Duplicate, Retryable, Rejected {}
  public record Applied() implements PushResult {}
  public record Duplicate() implements PushResult {}                          // server already applied this id: success
  public record Retryable(Duration after) implements PushResult {}            // 429 / 5xx
  public record Rejected(String reason) implements PushResult {}              // 4xx validation: never retry

  public interface SyncTransport {
    PushResult push(PendingOp op) throws IOException;                         // throws IOException when offline
  }

  public interface OutboxStore {
    List<PendingOp> load() throws IOException;
    void save(List<PendingOp> ops) throws IOException;
  }

  public sealed interface DrainOutcome permits Drained, Offline, RetryLater, AlreadyRunning {}
  public record Drained() implements DrainOutcome {}
  public record Offline() implements DrainOutcome {}
  public record RetryLater(Duration delay) implements DrainOutcome {}
  public record AlreadyRunning() implements DrainOutcome {}

  private final OutboxStore store;
  private final SyncTransport transport;
  private final int maxAttempts;
  private final Object state = new Object();                                  // guards queue, parked and loaded
  private final ReentrantLock draining = new ReentrantLock();                 // single flight
  private final ArrayDeque<PendingOp> queue = new ArrayDeque<>();
  private final List<PendingOp> parked = new ArrayList<>();                   // needs the user's attention
  private boolean loaded;

  public Outbox(OutboxStore store, SyncTransport transport, int maxAttempts) {
    this.store = store;
    this.transport = transport;
    this.maxAttempts = maxAttempts;
  }

  public int pendingCount() throws IOException {
    synchronized (state) { loadIfNeeded(); return queue.size(); }
  }

  public List<PendingOp> parkedOps() {
    synchronized (state) { return List.copyOf(parked); }
  }

  /** Persist first, then return: if the app dies a millisecond later, the intent survives. */
  public void enqueue(PendingOp op) throws IOException {
    synchronized (state) {
      loadIfNeeded();
      queue.addLast(op);
      store.save(new ArrayList<>(queue));
    }
  }

  public DrainOutcome drain() throws IOException {
    if (!draining.tryLock()) return new AlreadyRunning();                     // a drain is already running
    try {
      while (true) {
        PendingOp op;
        synchronized (state) { loadIfNeeded(); op = queue.peekFirst(); }
        if (op == null) return new Drained();
        PushResult result;
        try {
          result = transport.push(op);
        } catch (IOException e) {
          return new Offline();                                               // keep everything; try again later
        }
        synchronized (state) {
          if (result instanceof Applied || result instanceof Duplicate) {
            queue.removeFirst();
          } else if (result instanceof Rejected) {
            parked.add(queue.removeFirst());
          } else if (result instanceof Retryable retry) {
            PendingOp next = op.retried();
            queue.removeFirst();
            if (next.attempts() >= maxAttempts) {
              parked.add(next);
            } else {
              queue.addFirst(next);
              store.save(new ArrayList<>(queue));
              return new RetryLater(retry.after() != null ? retry.after() : Backoff.delay(next.attempts()));
            }
          }
          store.save(new ArrayList<>(queue));                                 // checkpoint after every op
        }
      }
    } finally {
      draining.unlock();
    }
  }

  private void loadIfNeeded() throws IOException {
    if (loaded) return;
    List<PendingOp> saved = store.load();
    for (int i = saved.size() - 1; i >= 0; i--) queue.addFirst(saved.get(i));
    loaded = true;
  }
}
