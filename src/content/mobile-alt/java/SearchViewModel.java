import java.time.Duration;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * Search-as-you-type: debounce keystrokes, ignore stale requests, never show
 * results for a query the user has already changed. Listeners run on a background thread:
 * on Android, post to the main thread (for example with a Handler or LiveData.postValue).
 */
public final class SearchViewModel implements AutoCloseable {
  public record SearchUi(List<String> results, boolean loading, String error) {
    static SearchUi empty() { return new SearchUi(List.of(), false, null); }
  }

  private final Function<String, List<String>> search;
  private final Duration debounce;
  private final int minLength;
  private final ScheduledExecutorService timer = Executors.newScheduledThreadPool(2, r -> {
    Thread t = new Thread(r, "search");
    t.setDaemon(true);
    return t;
  });
  private final List<Consumer<SearchUi>> listeners = new CopyOnWriteArrayList<>();
  private final AtomicInteger generation = new AtomicInteger();   // bumps on every new query
  private volatile SearchUi ui = SearchUi.empty();
  private ScheduledFuture<?> pending;
  private String lastQuery = "";

  public SearchViewModel(Function<String, List<String>> search, Duration debounce, int minLength) {
    this.search = search;
    this.debounce = debounce;
    this.minLength = minLength;
  }

  public SearchUi ui() { return ui; }

  public void subscribe(Consumer<SearchUi> listener) { listeners.add(listener); }

  public synchronized void onQueryChanged(String text) {
    String q = text.trim();
    if (q.equals(lastQuery)) return;                   // distinctUntilChanged
    lastQuery = q;
    int mine = generation.incrementAndGet();
    if (pending != null) pending.cancel(false);        // the debounce: typing again restarts the wait
    if (q.length() < minLength) {
      set(SearchUi.empty());
      return;
    }
    pending = timer.schedule(() -> run(q, mine), debounce.toMillis(), TimeUnit.MILLISECONDS);
  }

  private void run(String q, int mine) {
    set(new SearchUi(ui.results(), true, null));
    try {
      List<String> found = search.apply(q);
      if (mine != generation.get()) return;            // the query changed while we waited: drop it
      set(new SearchUi(found, false, null));
    } catch (RuntimeException e) {
      if (mine == generation.get()) set(new SearchUi(List.of(), false, "Search failed. Pull to retry."));
    }
  }

  private void set(SearchUi next) {
    ui = next;
    for (Consumer<SearchUi> l : listeners) l.accept(next);
  }

  @Override
  public void close() { timer.shutdownNow(); }
}
