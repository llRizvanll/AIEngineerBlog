/* Reverse the job post: which skills it really asks for, and where you are weakest against them. */
export interface SkillRule {
  skill: string;
  keywords: string[];
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// region: map
export function mapJobPost(post: string, rules: SkillRule[]): [string, number][] {
  const out: [string, number][] = [];
  for (const { skill, keywords } of rules) {
    const hits = keywords.reduce((n, k) => n + (post.match(new RegExp(`(^|[^a-z0-9])${escape(k)}(?![a-z0-9])`, "gi")) ?? []).length, 0);
    if (hits > 0) out.push([skill, hits]);
  }
  return out.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
// endregion

// region: gaps
/** Priority is demand times weakness, where 5 means strong. A skill you've nailed scores 0 and drops off. */
export function studyOrder(demand: [string, number][], myScores: Record<string, number>): { skill: string; priority: number }[] {
  return demand
    .map(([skill, hits]) => ({ skill, priority: hits * (5 - (myScores[skill] ?? 1)) }))
    .filter((x) => x.priority > 0)
    .sort((a, b) => b.priority - a.priority || a.skill.localeCompare(b.skill));
}
// endregion
