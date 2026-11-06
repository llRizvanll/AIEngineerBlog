const tokenize = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];

/** Okapi BM25 over an inverted index: term -> list of [doc, term frequency]. */
export class Bm25 {
  private index = new Map<string, [number, number][]>();
  private ids: string[] = [];
  private lengths: number[] = [];
  private k1: number;
  private b: number;

  constructor(k1 = 1.2, b = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  add(id: string, text: string): void {
    const doc = this.ids.push(id) - 1;
    const terms = tokenize(text);
    this.lengths.push(terms.length);
    const tf = new Map<string, number>();
    for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + 1);
    for (const [t, n] of tf) {
      if (!this.index.has(t)) this.index.set(t, []);
      this.index.get(t)!.push([doc, n]);
    }
  }

  search(query: string, top = 10): { id: string; score: number }[] {
    const N = this.ids.length;
    const avg = this.lengths.reduce((a, b) => a + b, 0) / Math.max(N, 1);
    const scores = new Map<number, number>();
    for (const term of new Set(tokenize(query))) {
      const postings = this.index.get(term) ?? [];
      const idf = Math.log(1 + (N - postings.length + 0.5) / (postings.length + 0.5));
      for (const [doc, tf] of postings) {
        const norm = tf + this.k1 * (1 - this.b + (this.b * this.lengths[doc]) / avg);
        scores.set(doc, (scores.get(doc) ?? 0) + (idf * tf * (this.k1 + 1)) / norm);
      }
    }
    return [...scores]
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([doc, score]) => ({ id: this.ids[doc], score }));
  }
}
