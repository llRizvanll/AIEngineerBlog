import { CASES, DEEP, PROTOCOLS, REELS, SERIES, totalCritical } from "./content";
import { PHASES } from "./curriculum";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { ALL_BEHAVIORAL } from "@/content/behavioral";
import { FLASHCARDS, modulesByFormat } from "@/content/modules";
import { AI_PATHS, BASIC_CARD_COUNT, LESSON_COUNT } from "@/content/ai-interviews";
import { RN_CARDS } from "@/content/rn-cards";
import { RN_HUB } from "@/content/rn-hub";
import type { NavGroup } from "./nav-types";

/**
 * The single source for the menu and the landing page. Add a section here and it
 * appears everywhere; counts follow the content automatically.
 * Order follows the spec's ladder: Learn runs macro to micro, Practice runs micro to macro.
 */
export function siteMap(): NavGroup[] {
  const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
  const reelCount = REELS.reduce((a, c) => a + c.reels.length, 0);
  const n = (f: Parameters<typeof modulesByFormat>[0]) => modulesByFormat(f).length;
  const problems = PATTERNS.length + Object.values(MORE_PROBLEMS).flat().length + n("coding-pattern");

  return [
    {
      id: "learn",
      label: "Learn",
      blurb: "Build the mental model, from whole system down to the wire.",
      items: [
        { href: "/aiengine", title: "Curriculum", desc: "Guided path through every phase.", icon: "compass", color: ["#6c47ff", "#ec4899"], count: plural(PHASES.length, "phase") },
        { href: "/paths/ai-interviews", title: "Crack AI interviews", desc: "Hacks, every round, a plan and a project.", icon: "bolt", color: ["#f59e0b", "#ec4899"], count: `${AI_PATHS.length} paths · ${LESSON_COUNT} lessons` },
        { href: "/paths/react-native", title: "React Native in one place", desc: "Architecture, state, memory, offline and budgets, in reading order.", icon: "phone", color: ["#0ea5e9", "#6c47ff"], count: `${RN_HUB.flatMap((g) => g.items).length} pages` },
        { href: "/paths/mobile-principal", title: "Mobile principal in two weeks", desc: "One edit, followed end to end, then reused.", icon: "phone", color: ["#f43f5e", "#6c47ff"], count: "14 days" },
        { href: "/deep", title: "Deep dives", desc: "Component internals and state machines.", icon: "layers", color: ["#8b5cf6", "#d946ef"], level: "Level 2 · Meso", count: plural(DEEP.length + n("deep-dive"), "page") },
        { href: "/protocols", title: "Protocols", desc: "Wire-level packets and low-level mechanics.", icon: "network", color: ["#06b6d4", "#10b981"], level: "Level 3 · Micro", count: plural(PROTOCOLS.length + n("protocol"), "lesson") },
      ],
    },
    {
      id: "practice",
      label: "Practice",
      blurb: "Prove it, from one function up to a whole system.",
      items: [
        { href: "/coding", title: "Coding patterns", desc: "Algorithm templates and worked problems.", icon: "code", color: ["#10b981", "#0ea5e9"], level: "Level 1 · Components", count: plural(problems, "problem") },
        { href: "/mobile-coding", title: "Machine coding", desc: "Tested components, built and explained.", icon: "phone", color: ["#14b8a6", "#6366f1"], level: "Level 2 · Sub-systems", count: plural(MOBILE_PROBLEMS.length + n("machine-coding"), "component") },
        { href: "/interview", title: "System design", desc: "Timed mock rounds with a whiteboard.", icon: "board", color: ["#0ea5e9", "#6c47ff"], level: "Level 3 · Integration", count: plural(CASES.length + n("system-design"), "round") },
        { href: "/problem-solving", title: "Behavioral", desc: "STAR answers, probes and red flags.", icon: "chat", color: ["#f59e0b", "#ec4899"], count: plural(ALL_BEHAVIORAL.length, "question") },
      ],
    },
    {
      id: "revise",
      label: "Revise",
      blurb: "Keep it, in minutes a day.",
      items: [
        { href: "/revise", title: "Flashcards", desc: "Spaced recall: due cards return on schedule.", icon: "cards", color: ["#a855f7", "#f43f5e"], count: plural(totalCritical() + FLASHCARDS.length + BASIC_CARD_COUNT + RN_CARDS.length, "card") },
        { href: "/paths/ai-interviews/basics", title: "Critical basics", desc: "Read, memorise and practise the AI interview essentials.", icon: "bolt", color: ["#22c55e", "#a855f7"], count: plural(BASIC_CARD_COUNT, "card") },
        { href: "/reels", title: "Reels", desc: "Swipeable lessons and animated code.", icon: "play", color: ["#f43f5e", "#f59e0b"], count: plural(reelCount, "reel") },
        { href: "/library", title: "My library", desc: "Saved pages, your notes and exports.", icon: "bookmark", color: ["#22c55e", "#0ea5e9"] },
      ],
    },
  ];
}
