import java.io.IOException
import java.util.UUID
import kotlin.time.Duration
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * One pending local change. [id] is generated on the device and doubles as the
 * idempotency key, so a retried push is applied by the server at most once.
 */
data class PendingOp(
  val entity: String,
  val payload: String,
  val id: String = UUID.randomUUID().toString(),
  val attempts: Int = 0,
)

sealed interface PushResult {
  data object Applied : PushResult
  data object Duplicate : PushResult                   // server already applied this id: success
  data class Retryable(val after: Duration?) : PushResult   // 429 / 5xx
  data class Rejected(val reason: String) : PushResult      // 4xx validation: never retry
}

fun interface SyncTransport {
  suspend fun push(op: PendingOp): PushResult          // throws IOException when offline
}

interface OutboxStore {
  suspend fun load(): List<PendingOp>
  suspend fun save(ops: List<PendingOp>)
}

/**
 * Durable, ordered queue of local writes. The UI enqueues and moves on; a sync job
 * drains it whenever the OS gives us time. Safe to kill at any line.
 */
class Outbox(
  private val store: OutboxStore,
  private val transport: SyncTransport,
  private val maxAttempts: Int = 8,
) {
  sealed interface DrainOutcome {
    data object Drained : DrainOutcome
    data object Offline : DrainOutcome
    data class Backoff(val delay: Duration) : DrainOutcome
    data object AlreadyRunning : DrainOutcome
  }

  private val state = Mutex()                          // guards queue, parked and loaded
  private val draining = Mutex()                       // single flight
  private val queue = ArrayDeque<PendingOp>()
  private val parked = mutableListOf<PendingOp>()      // needs the user's attention
  private var loaded = false

  suspend fun pendingCount(): Int = state.withLock { loadIfNeeded(); queue.size }
  suspend fun parkedOps(): List<PendingOp> = state.withLock { parked.toList() }

  /** Persist first, then return: if the app dies a millisecond later, the intent survives. */
  suspend fun enqueue(op: PendingOp) = state.withLock {
    loadIfNeeded()
    queue.addLast(op)
    store.save(queue.toList())
  }

  suspend fun drain(): DrainOutcome {
    if (!draining.tryLock()) return DrainOutcome.AlreadyRunning   // a drain is already running
    try {
      while (true) {
        val op = state.withLock { loadIfNeeded(); queue.firstOrNull() } ?: return DrainOutcome.Drained
        val result = try {
          transport.push(op)
        } catch (e: IOException) {
          return DrainOutcome.Offline                  // keep everything; try again later
        }
        state.withLock {
          when (result) {
            PushResult.Applied, PushResult.Duplicate -> queue.removeFirst()
            is PushResult.Rejected -> parked += queue.removeFirst()
            is PushResult.Retryable -> {
              val next = op.copy(attempts = op.attempts + 1)
              queue.removeFirst()
              if (next.attempts >= maxAttempts) {
                parked += next
              } else {
                queue.addFirst(next)
                store.save(queue.toList())
                return DrainOutcome.Backoff(result.after ?: Backoff.delay(next.attempts))
              }
            }
          }
          store.save(queue.toList())                   // checkpoint after every op
        }
      }
    } finally {
      draining.unlock()
    }
  }

  private suspend fun loadIfNeeded() {
    if (loaded) return
    val saved = store.load()
    queue.addAll(0, saved)
    loaded = true
  }
}
