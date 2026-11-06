type Matrix = number[][];

const mul = (a: Matrix, b: Matrix): Matrix => a.map((row) => b[0].map((_, j) => row.reduce((s, x, k) => s + x * b[k][j], 0)));
const combine = (w: Matrix, d: Matrix, sign: 1 | -1, scale: number): Matrix => w.map((row, i) => row.map((x, j) => x + sign * scale * d[i][j]));

/** W' = W + (alpha / r) * B @ A: bake the adapter into the weights. */
export const mergeAdapter = (w: Matrix, a: Matrix, b: Matrix, alpha: number): Matrix => combine(w, mul(b, a), 1, alpha / a.length);

/** The exact inverse, up to floating-point error: keep the original weights if you must be exact. */
export const unmergeAdapter = (w: Matrix, a: Matrix, b: Matrix, alpha: number): Matrix => combine(w, mul(b, a), -1, alpha / a.length);

/** Output with the adapter still separate: W x + (alpha / r) * B (A x). */
export function applyUnmerged(w: Matrix, a: Matrix, b: Matrix, alpha: number, x: number[]): number[] {
  const col = x.map((v) => [v]);
  const base = mul(w, col);
  const delta = mul(b, mul(a, col));
  return base.map((row, i) => row[0] + (alpha / a.length) * delta[i][0]);
}
