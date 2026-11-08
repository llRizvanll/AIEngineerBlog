export interface SearchUi {
  results: string[];
  loading: boolean;
  error: string | null;
}

export interface SearchOptions {
  debounceMs?: number;
  minLength?: number;
}

/**
 * Search-as-you-type: debounce keystrokes, ignore stale requests, never show
 * results for a query the user has already changed. In React, call subscribe from an effect.
 */
export class SearchViewModel {
  ui: SearchUi = { results: [], loading: false, error: null };
  private search: (q: string) => Promise<string[]>;
  private debounceMs: number;
  private minLength: number;
  private listeners = new Set<(ui: SearchUi) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private lastQuery = "";
  private generation = 0;                              // bumps on every new query

  constructor(search: (q: string) => Promise<string[]>, options: SearchOptions = {}) {
    this.search = search;
    this.debounceMs = options.debounceMs ?? 300;
    this.minLength = options.minLength ?? 2;
  }

  subscribe(listener: (ui: SearchUi) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onQueryChanged(text: string): void {
    const q = text.trim();
    if (q === this.lastQuery) return;                  // distinctUntilChanged
    this.lastQuery = q;
    const mine = ++this.generation;
    clearTimeout(this.timer);                          // the debounce: typing again restarts the wait
    if (q.length < this.minLength) {
      this.set({ results: [], loading: false, error: null });
      return;
    }
    this.timer = setTimeout(() => void this.run(q, mine), this.debounceMs);
  }

  private async run(q: string, mine: number): Promise<void> {
    this.set({ ...this.ui, loading: true });
    try {
      const found = await this.search(q);
      if (mine !== this.generation) return;            // the query changed while we waited: drop it
      this.set({ results: found, loading: false, error: null });
    } catch {
      if (mine === this.generation) this.set({ results: [], loading: false, error: "Search failed. Pull to retry." });
    }
  }

  private set(ui: SearchUi): void {
    this.ui = ui;
    this.listeners.forEach((l) => l(ui));
  }
}
