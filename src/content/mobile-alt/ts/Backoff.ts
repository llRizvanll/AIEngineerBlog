export const Backoff = {
  /**
   * Exponential backoff with full jitter: a random wait in [0, min(cap, base · 2^attempt)] milliseconds.
   * Jitter spreads retries out, so a million clients do not all return in the same second.
   */
  delay(attempt: number, baseMs = 500, capMs = 60_000, random: () => number = Math.random): number {
    const exponential = baseMs * 2 ** Math.min(Math.max(attempt, 0), 16);
    const ceiling = Math.min(capMs, exponential);
    return random() * ceiling;
  },
};

/** Errors that carry the server's Retry-After hint (HTTP 429 / 503), in milliseconds. */
export interface RetryAfterProviding {
  retryAfterMs?: number;
}

export interface RetryOptions {
  maxAttempts?: number;
  isRetryable?: (e: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
}

const isCancelled = (e: unknown) => e instanceof Error && e.name === "AbortError";

/** Retries [operation] with jittered backoff, honouring Retry-After and cancellation. */
export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 5, isRetryable = () => true, sleep = (ms) => new Promise<void>((r) => setTimeout(r, ms)) } = options;
  let attempt = 0;
  for (;;) {
    try {
      return await operation();
    } catch (e) {
      if (isCancelled(e)) throw e;                     // never retry a cancelled caller
      attempt++;
      if (attempt >= maxAttempts || !isRetryable(e)) throw e;
      const hint = (e as RetryAfterProviding).retryAfterMs;
      await sleep(hint ?? Backoff.delay(attempt));
    }
  }
}
