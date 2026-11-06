export interface Candidate {
  id: string;
  text: string;
}

interface Options {
  candidates?: number;
  top?: number;
  timeoutMs?: number;
}

/** Retrieve widely, rerank precisely. If the reranker fails or runs late, keep the retrieval order. */
export async function retrieveAndRerank(
  query: string,
  retrieve: (q: string, n: number) => Promise<Candidate[]>,
  rerank: (q: string, docs: Candidate[]) => Promise<number[]>,
  { candidates = 100, top = 5, timeoutMs = 300 }: Options = {}
): Promise<{ results: Candidate[]; reranked: boolean }> {
  const docs = await retrieve(query, candidates);
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("rerank timeout")), timeoutMs));
  try {
    const scores = await Promise.race([rerank(query, docs), timeout]);
    const order = docs.map((d, i) => ({ d, s: scores[i] })).sort((a, b) => b.s - a.s);
    return { results: order.slice(0, top).map((x) => x.d), reranked: true };
  } catch {
    return { results: docs.slice(0, top), reranked: false };
  }
}
