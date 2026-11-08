import java.util.concurrent.TimeUnit;
import java.util.function.LongSupplier;

/** Shared limiter for every caller in the app: callers wait their turn instead of failing. */
public final class RateLimiter {
  /**
   * Token bucket: allows short bursts up to [capacity], then a steady [refillPerSecond].
   * Protects your own API from your own app (pull-to-refresh spam, retry storms).
   * Not thread-safe on its own: share it through RateLimiter.
   */
  public static final class TokenBucket {
    final double capacity;
    final double refillPerSecond;
    private final LongSupplier nanoClock;
    private double tokens;
    private long lastRefill;

    public TokenBucket(double capacity, double refillPerSecond, LongSupplier nanoClock) {
      this.capacity = capacity;
      this.refillPerSecond = refillPerSecond;
      this.nanoClock = nanoClock;
      this.tokens = capacity;
      this.lastRefill = nanoClock.getAsLong();
    }

    public boolean tryConsume(double cost) {
      refill();
      if (tokens < cost) return false;
      tokens -= cost;
      return true;
    }

    /** Nanoseconds until [cost] tokens will be available. */
    public long waitNanos(double cost) {
      refill();
      double missing = Math.max(0.0, cost - tokens);
      return (long) (missing / refillPerSecond * 1e9);
    }

    private void refill() {
      long now = nanoClock.getAsLong();
      double elapsed = Math.max(0L, now - lastRefill) / 1e9;
      tokens = Math.min(capacity, tokens + elapsed * refillPerSecond);
      lastRefill = now;
    }
  }

  @FunctionalInterface
  public interface Sleeper {
    void sleepNanos(long nanos) throws InterruptedException;
  }

  private final TokenBucket bucket;
  private final Sleeper sleeper;

  public RateLimiter(double capacity, double refillPerSecond) {
    this(capacity, refillPerSecond, System::nanoTime, nanos -> TimeUnit.NANOSECONDS.sleep(nanos));
  }

  public RateLimiter(double capacity, double refillPerSecond, LongSupplier nanoClock, Sleeper sleeper) {
    this.bucket = new TokenBucket(capacity, refillPerSecond, nanoClock);
    this.sleeper = sleeper;
  }

  public void acquire(double cost) throws InterruptedException {
    if (cost > bucket.capacity) throw new IllegalArgumentException("cost can never be satisfied");
    while (true) {
      long wait;
      synchronized (bucket) {
        if (bucket.tryConsume(cost)) return;
        wait = bucket.waitNanos(cost);
      }
      sleeper.sleepNanos(wait);                        // sleep outside the lock
    }
  }
}
