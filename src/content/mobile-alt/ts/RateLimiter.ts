/**
 * Token bucket: allows short bursts up to [capacity], then a steady [refillPerSecond].
 * Protects your own API from your own app (pull-to-refresh spam, retry storms).
 */
export class TokenBucket {
  readonly capacity: number;
  readonly refillPerSecond: number;
  private now: () => number;
  private tokens: number;
  private lastRefill: number;

  constructor(capacity: number, refillPerSecond: number, now: () => number = () => performance.now()) {
    this.capacity = capacity;
    this.refillPerSecond = refillPerSecond;
    this.now = now;
    this.tokens = capacity;
    this.lastRefill = now();
  }

  tryConsume(cost = 1): boolean {
    this.refill();
    if (this.tokens < cost) return false;
    this.tokens -= cost;
    return true;
  }

  /** Milliseconds until [cost] tokens will be available. */
  waitTime(cost = 1): number {
    this.refill();
    const missing = Math.max(0, cost - this.tokens);
    return (missing / this.refillPerSecond) * 1000;
  }

  private refill(): void {
    const now = this.now();
    const elapsedSeconds = Math.max(0, now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillPerSecond);
    this.lastRefill = now;
  }
}

/** Shared limiter for every caller in the app: callers wait their turn instead of failing. */
export class RateLimiter {
  private bucket: TokenBucket;
  private sleep: (ms: number) => Promise<void>;

  constructor(capacity: number, refillPerSecond: number, now?: () => number, sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))) {
    this.bucket = new TokenBucket(capacity, refillPerSecond, now);
    this.sleep = sleep;
  }

  async acquire(cost = 1): Promise<void> {
    if (cost > this.bucket.capacity) throw new Error("cost can never be satisfied");
    for (;;) {
      if (this.bucket.tryConsume(cost)) return;        // check and take happen in one step: no lock needed
      await this.sleep(this.bucket.waitTime(cost));
    }
  }
}
