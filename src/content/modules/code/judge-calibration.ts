/** Cohen's kappa: agreement between two raters, beyond what chance would produce. */
export function cohenKappa(a: string[], b: string[]): number {
  const n = a.length;
  const labels = new Set([...a, ...b]);
  const observed = a.filter((x, i) => x === b[i]).length / n;
  let chance = 0;
  for (const l of labels) chance += (a.filter((x) => x === l).length / n) * (b.filter((x) => x === l).length / n);
  return chance === 1 ? 1 : (observed - chance) / (1 - chance);
}

export type Verdict = "first" | "second" | "tie";

/** Removes position bias: ask twice with the answers swapped; a verdict counts only if both agree. */
export async function debiasedVerdict(judge: (x: string, y: string) => Promise<Verdict>, a: string, b: string): Promise<"a" | "b" | "tie"> {
  const [one, two] = await Promise.all([judge(a, b), judge(b, a)]);
  if (one === "first" && two === "second") return "a";
  if (one === "second" && two === "first") return "b";
  return "tie";
}
