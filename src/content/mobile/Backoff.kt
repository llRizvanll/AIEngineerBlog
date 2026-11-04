import kotlin.coroutines.cancellation.CancellationException
import kotlin.random.Random
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.time.DurationUnit
import kotlinx.coroutines.delay

object Backoff {
  /**
   * Exponential backoff with full jitter: a random wait in [0, min(cap, base · 2^attempt)].
   * Jitter spreads retries out, so a million clients do not all return in the same second.
   */
  fun delay(
    attempt: Int,
    base: Duration = 500.milliseconds,
    cap: Duration = 60.seconds,
    random: (ClosedFloatingPointRange<Double>) -> Double = { it.start + Random.nextDouble() * (it.endInclusive - it.start) },
  ): Duration {
    val exponential = base * (1 shl attempt.coerceIn(0, 16))
    val ceiling = minOf(cap, exponential)
    return random(0.0..ceiling.toDouble(DurationUnit.SECONDS)).seconds
  }
}

/** Errors that carry the server's Retry-After hint (HTTP 429 / 503). */
interface RetryAfterProviding {
  val retryAfter: Duration?
}

/** Retries [operation] with jittered backoff, honouring Retry-After and cancellation. */
suspend fun <T> withRetry(
  maxAttempts: Int = 5,
  isRetryable: (Throwable) -> Boolean = { true },
  sleep: suspend (Duration) -> Unit = { delay(it) },
  operation: suspend () -> T,
): T {
  var attempt = 0
  while (true) {
    try {
      return operation()
    } catch (e: CancellationException) {
      throw e                                          // never retry a cancelled caller
    } catch (e: Exception) {
      attempt++
      if (attempt >= maxAttempts || !isRetryable(e)) throw e
      sleep((e as? RetryAfterProviding)?.retryAfter ?: Backoff.delay(attempt))
    }
  }
}
