import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;

/**
 * Memory → disk → network image loading with request coalescing:
 * fifty rows asking for the same URL trigger exactly one download.
 */
public final class ImageLoader {
  @FunctionalInterface
  public interface ImageFetcher {
    byte[] fetch(String url) throws Exception;
  }

  public interface DiskCache {
    byte[] get(String key);
    void put(String key, byte[] bytes);
  }

  private final ImageFetcher fetcher;
  private final Executor executor;          // app-wide pool: downloads outlive one caller
  private final DiskCache disk;             // may be null
  private final Object lock = new Object();
  private final LruCache<String, byte[]> memory;
  private final Map<String, CompletableFuture<byte[]>> inFlight = new HashMap<>();

  public ImageLoader(ImageFetcher fetcher, Executor executor, DiskCache disk, int memoryLimit) {
    this.fetcher = fetcher;
    this.executor = executor;
    this.disk = disk;
    this.memory = new LruCache<>(memoryLimit);
  }

  public CompletableFuture<byte[]> load(String url) {
    CompletableFuture<byte[]> download;
    synchronized (lock) {
      byte[] cached = memory.get(url);                                      // 1. memory
      if (cached != null) return CompletableFuture.completedFuture(cached);
      download = inFlight.get(url);                                         // 2. or join the download already running
      if (download == null) {
        download = CompletableFuture.supplyAsync(() -> download(url), executor);
        inFlight.put(url, download);
      }
    }
    CompletableFuture<byte[]> shared = download;
    return shared.whenComplete((bytes, error) -> {
      synchronized (lock) {
        if (error == null) memory.put(url, bytes, bytes.length);
        if (inFlight.get(url) == shared) inFlight.remove(url);              // clean up even if the download failed
      }
    });
  }

  private byte[] download(String url) {
    try {
      byte[] onDisk = disk == null ? null : disk.get(url);                  // 3. disk
      if (onDisk != null) return onDisk;
      byte[] bytes = fetcher.fetch(url);                                    // 4. network, written back to disk
      if (disk != null) disk.put(url, bytes);
      return bytes;
    } catch (Exception e) {
      throw new CompletionException(e);
    }
  }

  /** Call when a row is recycled before its image arrives and nobody else needs it. */
  public void cancel(String url) {
    CompletableFuture<byte[]> job;
    synchronized (lock) { job = inFlight.remove(url); }
    if (job != null) job.cancel(true);
  }

  public void clearMemory() {
    synchronized (lock) { memory.clear(); }
  }
}
