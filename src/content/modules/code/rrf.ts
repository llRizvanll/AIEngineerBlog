export interface RrfOptions {
  k?: number;
  weights?: number[];
  top?: number;
}

/** Reciprocal rank fusion: each list adds weight / (k + rank). Raw scores never enter the sum. */
export function rrf(lists: string[][], { k = 60, weights, top }: RrfOptions = {}): { id: string; score: number }[] {
  const scores = new Map<string, number>();
  lists.forEach((list, l) =>
    list.forEach((id, i) => scores.set(id, (scores.get(id) ?? 0) + (weights?.[l] ?? 1) / (k + i + 1)))
  );
  const ranked = [...scores].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
  return top === undefined ? ranked : ranked.slice(0, top);
}
