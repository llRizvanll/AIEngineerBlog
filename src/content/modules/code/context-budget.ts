export interface Sentence {
  text: string;
  score: number;
}

/** Keeps the highest-scoring sentences that fit the budget, then restores reading order. */
export function fitContext(sentences: Sentence[], budget: number, count: (s: string) => number): string[] {
  const ranked = sentences.map((s, i) => ({ ...s, i })).sort((a, b) => b.score - a.score);
  const kept: { text: string; i: number }[] = [];
  let used = 0;
  for (const s of ranked) {
    const cost = count(s.text);
    if (used + cost > budget) continue;
    used += cost;
    kept.push(s);
  }
  return kept.sort((a, b) => a.i - b.i).map((s) => s.text);
}
