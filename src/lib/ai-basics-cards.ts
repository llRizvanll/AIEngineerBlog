import type { ReviseCard } from "@/components/interview/Revise";
import { basicKey, BASICS } from "@/content/ai-interviews/basics";

export const AI_BASICS_GROUP = "ai-basics";

/** perSkill groups by skill, for the basics page. Otherwise all share one group, for the Revise page. */
export function basicCards(perSkill: boolean): ReviseCard[] {
  return BASICS.flatMap((s) =>
    s.memorise.map((c, i) => {
      const key = basicKey(s.id, i);
      return {
        key,
        link: key,
        group: perSkill ? s.id : AI_BASICS_GROUP,
        groupLabel: perSkill ? s.title : "AI interview basics",
        kind: "Recall",
        q: c.q,
        a: c.a,
        why: s.why,
        source: `Critical basics · ${s.title}`,
      };
    })
  );
}
