/* Turns "N days left" and honest self-scores into a schedule, with the last stretch done without AI. */
export interface RoundGoal {
  round: string;
  /** how much this round counts in your loop, 1 to 5 */
  weight: number;
  /** your baseline, 1 to 5 */
  score: number;
}

export type DayKind = "baseline" | "train" | "mock" | "ai-off" | "rest";
export interface PlanDay {
  day: number;
  kind: DayKind;
  focus: string;
}

// region: split
/** More time goes where a round counts most and you score lowest. Largest remainder keeps the total exact. */
export function allocateDays(goals: RoundGoal[], days: number): Record<string, number> {
  const need = goals.map((g) => ({ round: g.round, need: g.weight * Math.max(6 - g.score, 1) }));
  const total = need.reduce((a, b) => a + b.need, 0);
  const shares = need.map((n) => ({ ...n, exact: (n.need / total) * days, whole: Math.floor((n.need / total) * days) }));
  let left = days - shares.reduce((a, b) => a + b.whole, 0);
  [...shares]
    .sort((a, b) => b.exact - b.whole - (a.exact - a.whole) || a.round.localeCompare(b.round))
    .forEach((s) => {
      if (left > 0) {
        s.whole++;
        left--;
      }
    });
  return Object.fromEntries(shares.map((s) => [s.round, s.whole]));
}
// endregion

// region: plan
export function buildPlan(goals: RoundGoal[], days: number): PlanDay[] {
  if (days < 5) throw new Error("under 5 days, skip the plan and drill your weakest round");
  const aiOff = Math.max(2, Math.round(days * 0.25)); // the last quarter proves it stuck
  const trainDays = days - 2 - aiOff; // day 1 is the baseline and the last day is rest
  const counts = allocateDays(goals, trainDays);
  const queue = [...goals].sort((a, b) => a.score - b.score).map((g) => g.round);
  const plan: PlanDay[] = [{ day: 1, kind: "baseline", focus: "One timed mock per round, AI off. Write down your scores." }];
  for (let i = 0, d = 2; i < trainDays; i++, d++) {
    const round = queue.find((r) => counts[r] > 0) ?? queue[0];
    counts[round]--;
    queue.push(queue.splice(queue.indexOf(round), 1)[0]);
    plan.push({ day: d, kind: i % 4 === 3 ? "mock" : "train", focus: round });
  }
  for (let i = 0; i < aiOff; i++) plan.push({ day: plan.length + 1, kind: "ai-off", focus: queue[i % queue.length] });
  plan.push({ day: days, kind: "rest", focus: "Light card review only. Sleep." });
  return plan;
}
// endregion
