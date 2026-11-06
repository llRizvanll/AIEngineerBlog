/** vLLM-style prefix cache: each full block's key chains its parent's hash, its tokens and a salt. */
export class PrefixCache {
  private blocks = new Map<string, true>(); // Map order doubles as LRU order
  private blockTokens: number;
  private capacity: number;

  constructor(blockTokens = 16, capacity = 1024) {
    this.blockTokens = blockTokens;
    this.capacity = capacity;
  }

  private keys(tokens: number[], salt: string): string[] {
    // At least one token must still run through the model, so never cache the very last one.
    const whole = Math.floor((tokens.length - 1) / this.blockTokens);
    const out: string[] = [];
    let parent = salt;
    for (let b = 0; b < whole; b++) {
      parent = `${parent}|${tokens.slice(b * this.blockTokens, (b + 1) * this.blockTokens).join(",")}`;
      out.push(parent);
    }
    return out;
  }

  /** Number of prompt tokens the engine can skip. */
  lookup(tokens: number[], salt = ""): number {
    let hits = 0;
    for (const key of this.keys(tokens, salt)) {
      if (!this.blocks.has(key)) break;
      this.blocks.delete(key); // move to most recently used
      this.blocks.set(key, true);
      hits++;
    }
    return hits * this.blockTokens;
  }

  insert(tokens: number[], salt = ""): void {
    for (const key of this.keys(tokens, salt)) {
      this.blocks.delete(key);
      this.blocks.set(key, true);
      if (this.blocks.size > this.capacity) this.blocks.delete(this.blocks.keys().next().value as string);
    }
  }
}
