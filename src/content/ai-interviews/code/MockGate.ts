/* Practising with AI can feel better than you really are. This checks that the skill transferred. */
export interface MockScore {
  /** each 1 to 5 */
  problemSolving: number;
  codeQuality: number;
  verification: number;
  communication: number;
}

const FIELDS = ["problemSolving", "codeQuality", "verification", "communication"] as const;
const mean = (ns: number[]) => ns.reduce((a, b) => a + b, 0) / ns.length;

// region: gate
export function readiness(aiOn: MockScore[], aiOff: MockScore[]): { ready: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (aiOff.length < 3) return { ready: false, reasons: [`${3 - aiOff.length} more AI-off mock(s) needed`] };
  const recent = aiOff.slice(-3);
  const offAvg = mean(recent.flatMap((m) => FIELDS.map((f) => m[f])));
  if (offAvg < 3.5) reasons.push(`AI-off average is ${offAvg.toFixed(1)}, below 3.5`);
  for (const f of FIELDS) {
    const v = mean(recent.map((m) => m[f]));
    if (v < 3) reasons.push(`${f} is ${v.toFixed(1)}, below 3`);
  }
  if (aiOn.length > 0) {
    const gap = mean(aiOn.slice(-3).flatMap((m) => FIELDS.map((f) => m[f]))) - offAvg;
    if (gap > 0.5) reasons.push(`AI-on scores beat AI-off by ${gap.toFixed(1)}, so the AI is carrying you`);
  }
  return { ready: reasons.length === 0, reasons };
}
// endregion
