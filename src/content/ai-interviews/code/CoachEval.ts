/* Build your own mock interviewer. Step 4: does your coach score like a person would? */
export interface LabelledScore {
  human: number;
  model: number;
}

// region: agree
export function agreement(rows: LabelledScore[]) {
  if (rows.length === 0) throw new Error("no labelled scores yet");
  const share = (test: (r: LabelledScore) => boolean) => rows.filter(test).length / rows.length;
  return {
    exact: share((r) => r.human === r.model),
    withinOne: share((r) => Math.abs(r.human - r.model) <= 1),
    /** above 0 means the coach flatters you */
    bias: rows.reduce((a, r) => a + (r.model - r.human), 0) / rows.length,
  };
}
// endregion

// region: gate
/** A coach that flatters is the failure that hurts you most, so bias gets its own limit. */
export function coachIsTrustworthy(rows: LabelledScore[]): { ok: boolean; reasons: string[] } {
  const a = agreement(rows);
  const reasons: string[] = [];
  if (rows.length < 20) reasons.push(`only ${rows.length} labelled scores; label at least 20`);
  if (a.withinOne < 0.8) reasons.push(`within-one agreement is ${Math.round(a.withinOne * 100)}%, below 80%`);
  if (a.bias > 0.5) reasons.push(`scores run ${a.bias.toFixed(1)} points too kind`);
  return { ok: reasons.length === 0, reasons };
}
// endregion
