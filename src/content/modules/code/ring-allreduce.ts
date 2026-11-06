/**
 * Ring all-reduce: reduce-scatter, then all-gather, in 2(p - 1) steps.
 * Every rank sends one chunk per step, so each sends 2(p - 1)/p of the vector in total.
 */
export function ringAllReduce(vectors: number[][]): { result: number[][]; sentPerRank: number } {
  const p = vectors.length;
  const n = vectors[0].length;
  const size = Math.ceil(n / p);
  const chunks = vectors.map((v) => Array.from({ length: p }, (_, c) => v.slice(c * size, (c + 1) * size)));
  const mod = (x: number) => ((x % p) + p) % p;
  let sent = 0;

  // Reduce-scatter: each chunk travels round the ring, picking up every rank's values.
  for (let step = 0; step < p - 1; step++) {
    const msgs = chunks.map((rank, r) => ({ to: mod(r + 1), c: mod(r - step), data: [...rank[mod(r - step)]] }));
    sent += msgs[0].data.length;
    for (const m of msgs) m.data.forEach((x, i) => (chunks[m.to][m.c][i] += x));
  }
  // Rank r now holds the complete chunk r + 1. All-gather passes the finished chunks on.
  for (let step = 0; step < p - 1; step++) {
    const msgs = chunks.map((rank, r) => ({ to: mod(r + 1), c: mod(r + 1 - step), data: [...rank[mod(r + 1 - step)]] }));
    sent += msgs[0].data.length;
    for (const m of msgs) chunks[m.to][m.c] = m.data;
  }
  return { result: chunks.map((rank) => rank.flat()), sentPerRank: sent };
}
