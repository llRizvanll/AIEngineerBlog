export interface FeedPage<T> {
  items: T[];
  nextCursor: string | null;
}

export type FeedState = { kind: "idle" } | { kind: "loading" } | { kind: "failed"; message: string } | { kind: "end" };

/**
 * Cursor-based infinite feed: one request at a time, prefetch before the bottom,
 * drop duplicates when new posts shift the feed, and ignore stale responses after a refresh.
 */
export class FeedPaginator<T, ID> {
  items: T[] = [];
  state: FeedState = { kind: "idle" };
  private idOf: (t: T) => ID;
  private fetchPage: (cursor: string | null) => Promise<FeedPage<T>>;
  private cursor: string | null = null;
  private seen = new Set<ID>();
  private generation = 0;

  constructor(idOf: (t: T) => ID, fetchPage: (cursor: string | null) => Promise<FeedPage<T>>) {
    this.idOf = idOf;
    this.fetchPage = fetchPage;
  }

  async loadNext(): Promise<void> {
    if (this.state.kind === "loading" || this.state.kind === "end") return;   // single flight; nothing after the end
    this.state = { kind: "loading" };
    const requestGeneration = this.generation;
    try {
      const page = await this.fetchPage(this.cursor);
      if (requestGeneration !== this.generation) return;                      // a refresh happened meanwhile
      const fresh = page.items.filter((item) => {
        const id = this.idOf(item);
        if (this.seen.has(id)) return false;
        this.seen.add(id);
        return true;
      });
      this.items = [...this.items, ...fresh];
      this.cursor = page.nextCursor;
      this.state = page.nextCursor === null ? { kind: "end" } : { kind: "idle" };
    } catch (e) {
      if (requestGeneration === this.generation) this.state = { kind: "failed", message: e instanceof Error ? e.message : "Could not load" };
    }
  }

  async refresh(): Promise<void> {
    this.generation++;
    this.items = [];
    this.seen.clear();
    this.cursor = null;
    this.state = { kind: "idle" };
    await this.loadNext();
  }

  /** Call as each row is rendered: start the next page when the user nears the end. */
  async onItemShown(index: number, prefetchDistance = 5): Promise<void> {
    if (index >= this.items.length - prefetchDistance) await this.loadNext();
  }
}
