/* A small eval harness: the thing an eval take-home asks you to build. */
export interface EvalCase<I> {
  id: string;
  input: I;
  /** the slice this case belongs to, such as "billing" or "non-english" */
  tag: string;
}
export type Grader<I, O> = (input: I, output: O) => boolean;

export interface EvalReport {
  total: number;
  passed: number;
  byTag: Record<string, { total: number; passed: number }>;
  failures: string[];
}

// region: run
export async function runEval<I, O>(cases: EvalCase<I>[], system: (input: I) => Promise<O>, grade: Grader<I, O>): Promise<EvalReport> {
  const report: EvalReport = { total: 0, passed: 0, byTag: {}, failures: [] };
  for (const c of cases) {
    const tag = (report.byTag[c.tag] ??= { total: 0, passed: 0 });
    report.total++;
    tag.total++;
    let ok = false;
    try {
      ok = grade(c.input, await system(c.input));
    } catch {
      ok = false; // a crash is a failed case, not a broken run
    }
    if (ok) {
      report.passed++;
      tag.passed++;
    } else {
      report.failures.push(c.id);
    }
  }
  return report;
}
// endregion

// region: gate
/** Checks every slice, because a better average can hide a slice that got much worse. */
export function releaseGate(base: EvalReport, next: EvalReport, maxDrop: number): { ship: boolean; blockers: string[] } {
  const rate = (r: { passed: number; total: number }) => (r.total ? r.passed / r.total : 0);
  const blockers: string[] = [];
  if (rate(next) < rate(base) - maxDrop) blockers.push("overall");
  for (const [tag, b] of Object.entries(base.byTag)) {
    const n = next.byTag[tag];
    if (!n) blockers.push(`${tag}: cases missing`);
    else if (rate(n) < rate(b) - maxDrop) blockers.push(tag);
  }
  return { ship: blockers.length === 0, blockers };
}
// endregion

// region: wilson
/** The honest range for a pass rate. 18 of 20 is 90%, but the data can't rule out about 70%. */
export function wilsonInterval(passed: number, total: number, z = 1.96): [number, number] {
  if (total === 0) return [0, 1];
  const p = passed / total;
  const d = 1 + (z * z) / total;
  const mid = p + (z * z) / (2 * total);
  const spread = z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));
  return [(mid - spread) / d, (mid + spread) / d];
}
// endregion

// region: kappa
/** Agreement after removing what chance alone would give. Check this before an LLM judge gates a release. */
export function cohenKappa(human: boolean[], judge: boolean[]): number {
  if (human.length !== judge.length || human.length === 0) throw new Error("need two equal, non-empty label lists");
  const n = human.length;
  const agree = human.filter((h, i) => h === judge[i]).length / n;
  const humanYes = human.filter(Boolean).length / n;
  const judgeYes = judge.filter(Boolean).length / n;
  const chance = humanYes * judgeYes + (1 - humanYes) * (1 - judgeYes);
  return chance === 1 ? 1 : (agree - chance) / (1 - chance);
}
// endregion
