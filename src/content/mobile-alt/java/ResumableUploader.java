import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Uploads only the parts that are missing, at most [maxConcurrent] at a time, checkpointing
 * each one. A kill or a failure loses at most the parts that were in flight.
 */
public final class ResumableUploader {
  /**
   * The resumable state of one multipart upload. Persist it after every part:
   * it is all you need to continue after the process is killed.
   */
  public record UploadPlan(String fileId, int size, int partSize, Map<Integer, String> completed) {   // part number → ETag
    public int partCount() { return (size + partSize - 1) / partSize; }

    public List<Integer> remaining() {
      List<Integer> out = new ArrayList<>();
      for (int i = 0; i < partCount(); i++) if (!completed.containsKey(i)) out.add(i);
      return out;
    }

    public boolean isComplete() { return completed.size() == partCount(); }

    /** {from, to}: the [from, to) byte range of one part. */
    public int[] byteRange(int part) { return new int[] {part * partSize, Math.min(size, (part + 1) * partSize)}; }

    UploadPlan withPart(int part, String etag) {
      Map<Integer, String> next = new HashMap<>(completed);
      next.put(part, etag);
      return new UploadPlan(fileId, size, partSize, Map.copyOf(next));
    }
  }

  @FunctionalInterface
  public interface PartUploader {
    String upload(String fileId, int part, byte[] bytes) throws Exception;   // returns the ETag
  }

  @FunctionalInterface
  public interface CheckpointStore {
    void save(UploadPlan plan) throws Exception;
  }

  private final PartUploader uploader;
  private final CheckpointStore checkpoints;
  private final int maxConcurrent;

  public ResumableUploader(PartUploader uploader, CheckpointStore checkpoints, int maxConcurrent) {
    this.uploader = uploader;
    this.checkpoints = checkpoints;
    this.maxConcurrent = maxConcurrent;
  }

  public UploadPlan upload(byte[] file, UploadPlan initial) throws Exception {
    if (file.length != initial.size()) throw new IllegalArgumentException("plan does not match the file");
    ConcurrentLinkedQueue<Integer> parts = new ConcurrentLinkedQueue<>(initial.remaining());   // one queue, N workers
    Object lock = new Object();
    UploadPlan[] plan = {initial};
    AtomicReference<Exception> failure = new AtomicReference<>();
    ExecutorService pool = Executors.newFixedThreadPool(maxConcurrent);
    try {
      List<Future<?>> workers = new ArrayList<>();
      for (int i = 0; i < maxConcurrent; i++) {
        workers.add(pool.submit(() -> {
          Integer part;
          while (failure.get() == null && (part = parts.poll()) != null) {
            try {
              int[] range = initial.byteRange(part);
              byte[] bytes = Arrays.copyOfRange(file, range[0], range[1]);
              String etag = uploader.upload(initial.fileId(), part, bytes);
              synchronized (lock) {
                plan[0] = plan[0].withPart(part, etag);
                checkpoints.save(plan[0]);                                  // durable before this worker takes another part
              }
            } catch (Exception e) {
              failure.compareAndSet(null, e);                               // one failing part stops the others from starting more
              return;
            }
          }
        }));
      }
      for (Future<?> worker : workers) worker.get();
    } finally {
      pool.shutdownNow();
    }
    if (failure.get() != null) throw failure.get();
    return plan[0];
  }
}
