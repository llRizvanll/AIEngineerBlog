import Foundation

/// Token bucket: allows short bursts up to `capacity`, then a steady `refillPerSecond`.
/// Protects your own API from your own app (pull-to-refresh spam, retry storms).
struct TokenBucket {
    let capacity: Double
    let refillPerSecond: Double
    private var tokens: Double
    private var lastRefill: ContinuousClock.Instant

    init(capacity: Double, refillPerSecond: Double, now: ContinuousClock.Instant = .now) {
        self.capacity = capacity
        self.refillPerSecond = refillPerSecond
        self.tokens = capacity
        self.lastRefill = now
    }

    mutating func tryConsume(_ cost: Double = 1, now: ContinuousClock.Instant = .now) -> Bool {
        refill(now: now)
        guard tokens >= cost else { return false }
        tokens -= cost
        return true
    }

    /// How long until `cost` tokens will be available.
    mutating func waitTime(for cost: Double = 1, now: ContinuousClock.Instant = .now) -> Duration {
        refill(now: now)
        let missing = max(0, cost - tokens)
        return .seconds(missing / refillPerSecond)
    }

    private mutating func refill(now: ContinuousClock.Instant) {
        let elapsed = max(0, lastRefill.duration(to: now) / .seconds(1))
        tokens = min(capacity, tokens + elapsed * refillPerSecond)
        lastRefill = now
    }
}

/// Shared limiter for every caller in the app: callers wait their turn instead of failing.
actor RateLimiter {
    private var bucket: TokenBucket

    init(capacity: Double, refillPerSecond: Double) {
        bucket = TokenBucket(capacity: capacity, refillPerSecond: refillPerSecond)
    }

    func acquire(_ cost: Double = 1) async throws {
        while !bucket.tryConsume(cost) {
            try await Task.sleep(for: bucket.waitTime(for: cost))
        }
    }
}
