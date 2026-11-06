function sample(dist: number[], rand: () => number): number {
  let r = rand();
  for (let i = 0; i < dist.length; i++) {
    r -= dist[i];
    if (r <= 0) return i;
  }
  return dist.length - 1;
}

/**
 * One speculative step. The draft proposes x ~ q; the target accepts it with min(1, p(x)/q(x));
 * otherwise it samples from the leftover max(0, p - q). The output follows p exactly.
 */
export function speculativeStep(p: number[], q: number[], rand: () => number = Math.random) {
  const x = sample(q, rand);
  if (rand() < Math.min(1, p[x] / q[x])) return { token: x, accepted: true };
  const residual = p.map((pi, i) => Math.max(0, pi - q[i]));
  const mass = residual.reduce((a, b) => a + b, 0);
  return { token: sample(residual.map((r) => r / mass), rand), accepted: false };
}

/** Expected acceptance rate: the overlap of the two distributions. */
export const acceptRate = (p: number[], q: number[]) => p.reduce((sum, pi, i) => sum + Math.min(pi, q[i]), 0);
