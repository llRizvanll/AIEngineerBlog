const cosine = (a: number[], b: number[]) => {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  return dot / (Math.hypot(...a) * Math.hypot(...b));
};

interface Entry<V> {
  vector: number[];
  value: V;
  expires: number;
}

/** Answers a question from a previous similar question. Tenants never share entries. */
export class SemanticCache<V> {
  private entries = new Map<string, Entry<V>[]>();
  private embed: (text: string) => Promise<number[]>;
  private threshold: number;
  private ttlMs: number;
  private now: () => number;

  constructor(embed: (text: string) => Promise<number[]>, opts: { threshold?: number; ttlMs?: number; now?: () => number } = {}) {
    this.embed = embed;
    this.threshold = opts.threshold ?? 0.92;
    this.ttlMs = opts.ttlMs ?? 3_600_000;
    this.now = opts.now ?? Date.now;
  }

  async get(tenant: string, query: string): Promise<V | null> {
    const v = await this.embed(query);
    const live = (this.entries.get(tenant) ?? []).filter((e) => e.expires > this.now());
    this.entries.set(tenant, live);
    let best: Entry<V> | null = null;
    let bestScore = this.threshold;
    for (const e of live) {
      const score = cosine(v, e.vector);
      if (score >= bestScore) {
        best = e;
        bestScore = score;
      }
    }
    return best?.value ?? null;
  }

  async put(tenant: string, query: string, value: V): Promise<void> {
    const entry = { vector: await this.embed(query), value, expires: this.now() + this.ttlMs };
    this.entries.set(tenant, [...(this.entries.get(tenant) ?? []), entry]);
  }
}
