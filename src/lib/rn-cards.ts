import type { ReviseCard } from "@/types/revise";
import { RN_CARDS } from "@/content/rn-cards";
import { getModule } from "@/content/modules";

export const RN_GROUP = "rn-scale";
export const rnCardKey = (i: number) => `rn-scale:${i}`;

export function rnCards(): ReviseCard[] {
  return RN_CARDS.map(([q, a, why, moduleId], i) => ({
    key: rnCardKey(i),
    link: rnCardKey(i),
    group: RN_GROUP,
    groupLabel: "React Native at scale",
    kind: "Recall",
    q,
    a,
    why,
    source: getModule(moduleId)?.title ?? moduleId,
  }));
}
