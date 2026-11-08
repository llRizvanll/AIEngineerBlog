/* A CI gate for performance numbers. Single runs are noisy, so it judges the median of several. */
export interface Budget {
  metric: string;
  /** the limit: a maximum, or a minimum when higherIsBetter */
  limit: number;
  higherIsBetter?: boolean;
}
export interface Row {
  metric: string;
  value: number;
  pass: boolean;
  why: string;
}

// region: median
export function median(values: number[]): number {
  if (values.length === 0) throw new Error("no runs");
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
// endregion

// region: gate
export function gate(runs: Record<string, number[]>, budgets: Budget[], baseline: Record<string, number> = {}, tolerancePct = 5, minRuns = 5) {
  const rows: Row[] = budgets.map((b) => {
    const samples = runs[b.metric] ?? [];
    if (samples.length < minRuns) return { metric: b.metric, value: NaN, pass: false, why: `only ${samples.length} runs, need ${minRuns}` };
    const value = median(samples);
    const within = b.higherIsBetter ? value >= b.limit : value <= b.limit;
    if (!within) return { metric: b.metric, value, pass: false, why: `${value} breaks the limit of ${b.limit}` };
    const before = baseline[b.metric];
    if (before !== undefined) {
      const worse = b.higherIsBetter ? ((before - value) / before) * 100 : ((value - before) / before) * 100;
      if (worse > tolerancePct) return { metric: b.metric, value, pass: false, why: `${worse.toFixed(1)}% worse than the baseline of ${before}` };
    }
    return { metric: b.metric, value, pass: true, why: "within budget" };
  });
  return { pass: rows.every((r) => r.pass), rows };
}
// endregion
