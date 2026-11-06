/* The core of a RAG round: split, rank two ways, merge, and measure. */

// region: chunk
/** Overlap means a sentence cut at a boundary still appears whole in the next chunk. */
export function chunkWords(text: string, size: number, overlap: number): string[] {
  if (overlap >= size) throw new Error("overlap must be smaller than size");
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += size - overlap) {
    out.push(words.slice(i, i + size).join(" "));
    if (i + size >= words.length) break;
  }
  return out;
}
// endregion

// region: cosine
/** Compares direction, not length, so a long document doesn't win by being long. */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
// endregion

// region: rrf
/** Keyword and vector scores use different scales, so merge by rank instead of by score. */
export function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  const scores = new Map<string, number>();
  for (const ranking of rankings) {
    ranking.forEach((id, rank) => scores.set(id, (scores.get(id) ?? 0) + 1 / (k + rank + 1)));
  }
  return [...scores].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([id]) => id);
}
// endregion

// region: metrics
export interface Labelled {
  retrieved: string[];
  relevant: string[];
}

/** Of the documents that matter, what share reached the top k? Averaged over questions. */
export function recallAtK(rows: Labelled[], k: number): number {
  const each = rows.map((r) => r.relevant.filter((id) => r.retrieved.slice(0, k).includes(id)).length / r.relevant.length);
  return each.reduce((a, b) => a + b, 0) / rows.length;
}

/** How high does the first useful document sit? 1 means first place. */
export function meanReciprocalRank(rows: Labelled[]): number {
  const each = rows.map((r) => {
    const at = r.retrieved.findIndex((id) => r.relevant.includes(id));
    return at === -1 ? 0 : 1 / (at + 1);
  });
  return each.reduce((a, b) => a + b, 0) / rows.length;
}
// endregion
