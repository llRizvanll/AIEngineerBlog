import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

/**
 * Cursor-based infinite feed: one request at a time, prefetch before the bottom,
 * drop duplicates when new posts shift the feed, and ignore stale responses after a refresh.
 * All state changes happen under one lock, so it is safe to call from any thread.
 */
public final class FeedPaginator<T, ID> {
  public record FeedPage<T>(List<T> items, String nextCursor) {}

  public sealed interface State permits Idle, Loading, Failed, End {}
  public record Idle() implements State {}
  public record Loading() implements State {}
  public record Failed(String message) implements State {}
  public record End() implements State {}

  private final Function<T, ID> idOf;
  private final Function<String, CompletableFuture<FeedPage<T>>> fetch;
  private List<T> items = List.of();
  private State state = new Idle();
  private String cursor;
  private final Set<ID> seen = new HashSet<>();
  private int generation;

  public FeedPaginator(Function<T, ID> idOf, Function<String, CompletableFuture<FeedPage<T>>> fetch) {
    this.idOf = idOf;
    this.fetch = fetch;
  }

  public synchronized List<T> items() { return items; }

  public synchronized State state() { return state; }

  public CompletableFuture<Void> loadNext() {
    final int requestGeneration;
    final String requestCursor;
    synchronized (this) {
      if (state instanceof Loading || state instanceof End) return CompletableFuture.completedFuture(null);   // single flight; nothing after the end
      state = new Loading();
      requestGeneration = generation;
      requestCursor = cursor;
    }
    return fetch.apply(requestCursor).handle((page, error) -> {
      synchronized (this) {
        if (requestGeneration != generation) return null;       // a refresh happened meanwhile
        if (error != null) {
          Throwable cause = error.getCause() != null ? error.getCause() : error;
          state = new Failed(cause.getMessage() != null ? cause.getMessage() : "Could not load");
          return null;
        }
        List<T> next = new ArrayList<>(items);
        for (T item : page.items()) if (seen.add(idOf.apply(item))) next.add(item);
        items = List.copyOf(next);
        cursor = page.nextCursor();
        state = page.nextCursor() == null ? new End() : new Idle();
        return null;
      }
    });
  }

  public CompletableFuture<Void> refresh() {
    synchronized (this) {
      generation++;
      items = List.of();
      seen.clear();
      cursor = null;
      state = new Idle();
    }
    return loadNext();
  }

  /** Call as each row is bound: start the next page when the user nears the end. */
  public CompletableFuture<Void> onItemShown(int index, int prefetchDistance) {
    boolean near;
    synchronized (this) { near = index >= items.size() - prefetchDistance; }
    return near ? loadNext() : CompletableFuture.completedFuture(null);
  }
}
