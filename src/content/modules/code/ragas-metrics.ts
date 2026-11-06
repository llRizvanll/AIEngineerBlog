const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const cosine = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0) / (Math.hypot(...a) * Math.hypot(...b));

/** Faithfulness: share of the answer's claims that the retrieved context supports. */
export const faithfulness = (supported: boolean[]) => mean(supported.map(Number));

/** Context recall: share of the reference answer's claims that the context can attribute. */
export const contextRecall = (attributed: boolean[]) => mean(attributed.map(Number));

/** Context precision: mean precision@k over the ranks that hold a relevant chunk. */
export function contextPrecision(relevantAtRank: boolean[]): number {
  let hits = 0;
  const precisions: number[] = [];
  relevantAtRank.forEach((relevant, i) => {
    if (relevant) precisions.push(++hits / (i + 1));
  });
  return mean(precisions);
}

/** Answer relevance: questions regenerated from the answer should resemble the real question. */
export const answerRelevance = (question: number[], generated: number[][]) => mean(generated.map((g) => cosine(question, g)));
