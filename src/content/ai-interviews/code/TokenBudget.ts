/* The arithmetic behind the LLM fundamentals screen: context limits and cost. */

// region: fit
/** About four characters per token in English. Good for planning; use a real counter before sending. */
export const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export interface Chunk {
  id: string;
  text: string;
  score: number;
}

/** Take the best chunks that fit, after saving room for the fixed text and the reply. */
export function fitContext(fixedText: string, chunks: Chunk[], contextLimit: number, replyTokens: number) {
  let left = contextLimit - replyTokens - estimateTokens(fixedText);
  if (left <= 0) throw new Error("the fixed text and reply already fill the context");
  const kept: Chunk[] = [];
  const dropped: string[] = [];
  for (const c of [...chunks].sort((a, b) => b.score - a.score)) {
    const need = estimateTokens(c.text);
    if (need <= left) {
      kept.push(c);
      left -= need;
    } else {
      dropped.push(c.id);
    }
  }
  return { kept, dropped, tokensLeft: left };
}
// endregion

// region: cost
export interface Prices {
  /** dollars per million tokens */
  input: number;
  output: number;
  cachedInput: number;
}

export function requestCost(inputTokens: number, cachedTokens: number, outputTokens: number, p: Prices): number {
  const fresh = inputTokens - cachedTokens;
  return (fresh * p.input + cachedTokens * p.cachedInput + outputTokens * p.output) / 1_000_000;
}

export const monthlyCost = (costPerRequest: number, requestsPerDay: number) => costPerRequest * requestsPerDay * 30;
// endregion
