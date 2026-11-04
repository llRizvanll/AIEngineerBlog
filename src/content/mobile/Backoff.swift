import Foundation

enum Backoff {
    /// Exponential backoff with full jitter: a random wait in [0, min(cap, base · 2^attempt)].
    /// Jitter spreads retries out, so a million clients do not all return in the same second.
    static func delay(
        attempt: Int,
        base: Duration = .milliseconds(500),
        cap: Duration = .seconds(60),
        random: (ClosedRange<Double>) -> Double = { Double.random(in: $0) }
    ) -> Duration {
        let exponential = base * (1 << min(max(attempt, 0), 16))
        let ceiling = min(cap, exponential)
        return .seconds(random(0...(ceiling / .seconds(1))))
    }
}

/// Errors that carry the server's Retry-After hint (HTTP 429 / 503).
protocol RetryAfterProviding: Error {
    var retryAfter: Duration? { get }
}

/// Retries `operation` with jittered backoff, honouring Retry-After and cancellation.
func withRetry<T: Sendable>(
    maxAttempts: Int = 5,
    isRetryable: (any Error) -> Bool = { _ in true },
    sleep: (Duration) async throws -> Void = { try await Task.sleep(for: $0) },
    _ operation: () async throws -> T
) async throws -> T {
    var attempt = 0
    while true {
        do {
            return try await operation()
        } catch {
            attempt += 1
            guard attempt < maxAttempts, isRetryable(error), !Task.isCancelled else { throw error }
            let hinted = (error as? any RetryAfterProviding)?.retryAfter
            try await sleep(hinted ?? Backoff.delay(attempt: attempt))
        }
    }
}
