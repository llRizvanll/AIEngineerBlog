const normalise = (v: number[]) => {
  const n = Math.hypot(...v);
  return v.map((x) => x / n);
};

/** CLIP's symmetric InfoNCE: each image should match its own caption, and each caption its image. */
export function clipLoss(images: number[][], texts: number[][], temperature = 0.07): number {
  const I = images.map(normalise);
  const T = texts.map(normalise);
  const n = I.length;
  const logits = I.map((a) => T.map((b) => a.reduce((s, x, i) => s + x * b[i], 0) / temperature));
  const crossEntropy = (m: number[][]) =>
    m.reduce((sum, row, i) => {
      const denom = row.reduce((s, x) => s + Math.exp(x), 0);
      return sum - Math.log(Math.exp(row[i]) / denom);
    }, 0) / n;
  const transpose = logits[0].map((_, j) => logits.map((row) => row[j]));
  return (crossEntropy(logits) + crossEntropy(transpose)) / 2;
}
