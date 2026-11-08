import java.time.Duration;
import java.util.concurrent.Callable;
import java.util.function.DoubleUnaryOperator;
import java.util.function.Predicate;

public final class Backoff {
  private Backoff() {}

  /** Errors that carry the server's Retry-After hint (HTTP 429 / 503). */
  public interface RetryAfterProviding {
    Duration retryAfter();
  }

  @FunctionalInterface
  public interface Sleeper {
    void sleep(Duration duration) throws InterruptedException;
  }

  /**
   * Exponential backoff with full jitter: a random wait in [0, min(cap, base · 2^attempt)].
   * [random] receives that ceiling in seconds and returns a value between 0 and it.
   * Jitter spreads retries out, so a million clients do not all return in the same second.
   */
  public static Duration delay(int attempt, Duration base, Duration cap, DoubleUnaryOperator random) {
    Duration exponential = base.multipliedBy(1L << Math.min(Math.max(attempt, 0), 16));
    Duration ceiling = exponential.compareTo(cap) < 0 ? exponential : cap;
    double seconds = random.applyAsDouble(ceiling.toNanos() / 1e9);
    return Duration.ofNanos((long) (seconds * 1e9));
  }

  public static Duration delay(int attempt) {
    return delay(attempt, Duration.ofMillis(500), Duration.ofSeconds(60), max -> Math.random() * max);
  }

  /** Retries [operation] with jittered backoff, honouring Retry-After and cancellation (interruption). */
  public static <T> T withRetry(Callable<T> operation, int maxAttempts, Predicate<Exception> isRetryable, Sleeper sleep) throws Exception {
    int attempt = 0;
    while (true) {
      try {
        return operation.call();
      } catch (InterruptedException e) {
        throw e;                                       // never retry a cancelled caller
      } catch (Exception e) {
        attempt++;
        if (attempt >= maxAttempts || !isRetryable.test(e)) throw e;
        Duration hint = e instanceof RetryAfterProviding provider ? provider.retryAfter() : null;
        sleep.sleep(hint != null ? hint : delay(attempt));
      }
    }
  }
}
