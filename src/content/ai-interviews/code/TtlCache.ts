/* The practice file for the code comprehension round: read it, find what's wrong, then fix it. */
type Clock = () => number;
interface Item<V> {
  value: V;
  expires: number;
}

// region: inherited
/** Meant to be an LRU cache with expiry. It has three bugs, and no test here fails yet. */
export class TtlCacheInherited<V> {
  private items = new Map<string, Item<V>>();
  private max: number;
  private ttlMs: number;
  private now: Clock;
  constructor(max: number, ttlMs: number, now: Clock) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.now = now;
  }
  get(key: string): V | undefined {
    const item = this.items.get(key);
    if (!item || item.expires <= this.now()) return undefined;
    return item.value;
  }
  set(key: string, value: V): void {
    if (this.items.size >= this.max) {
      const oldest = this.items.keys().next().value as string;
      this.items.delete(oldest);
    }
    this.items.set(key, { value, expires: this.now() + this.ttlMs });
  }
  get size(): number {
    return this.items.size;
  }
}
// endregion

// region: fixed
/** Map keeps insertion order, so delete-then-set moves a key to the "most recent" end. */
export class TtlCache<V> {
  private items = new Map<string, Item<V>>();
  private max: number;
  private ttlMs: number;
  private now: Clock;
  constructor(max: number, ttlMs: number, now: Clock) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.now = now;
  }
  get(key: string): V | undefined {
    const item = this.items.get(key);
    if (!item) return undefined;
    this.items.delete(key);
    if (item.expires <= this.now()) return undefined;
    this.items.set(key, item);
    return item.value;
  }
  set(key: string, value: V): void {
    this.items.delete(key);
    if (this.items.size >= this.max) {
      const oldest = this.items.keys().next().value as string;
      this.items.delete(oldest);
    }
    this.items.set(key, { value, expires: this.now() + this.ttlMs });
  }
  get size(): number {
    return this.items.size;
  }
}
// endregion
