import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit
import kotlin.time.TimeSource
import kotlinx.coroutines.delay
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * Token bucket: allows short bursts up to [capacity], then a steady [refillPerSecond].
 * Protects your own API from your own app (pull-to-refresh spam, retry storms).
 * Not thread-safe on its own: share it through [RateLimiter].
 */
class TokenBucket(
  val capacity: Double,
  val refillPerSecond: Double,
  private val clock: TimeSource.WithComparableMarks = TimeSource.Monotonic,
) {
  private var tokens = capacity
  private var lastRefill = clock.markNow()

  fun tryConsume(cost: Double = 1.0): Boolean {
    refill()
    if (tokens < cost) return false
    tokens -= cost
    return true
  }

  /** How long until [cost] tokens will be available. */
  fun waitTime(cost: Double = 1.0): Duration {
    refill()
    val missing = maxOf(0.0, cost - tokens)
    return (missing / refillPerSecond).seconds
  }

  private fun refill() {
    val now = clock.markNow()
    val elapsed = (now - lastRefill).toDouble(DurationUnit.SECONDS).coerceAtLeast(0.0)
    tokens = minOf(capacity, tokens + elapsed * refillPerSecond)
    lastRefill = now
  }
}

/** Shared limiter for every caller in the app: callers wait their turn instead of failing. */
class RateLimiter(capacity: Double, refillPerSecond: Double) {
  private val bucket = TokenBucket(capacity, refillPerSecond)
  private val lock = Mutex()

  suspend fun acquire(cost: Double = 1.0) {
    require(cost <= bucket.capacity) { "cost can never be satisfied" }
    while (true) {
      val wait = lock.withLock {
        if (bucket.tryConsume(cost)) return
        bucket.waitTime(cost)
      }
      delay(wait)                                      // sleep outside the lock
    }
  }
}
