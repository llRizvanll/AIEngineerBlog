import { CASES, DEEP, PROTOCOLS, REELS, SERIES, totalCritical } from "./content";
import { PHASES } from "./curriculum";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { ALL_BEHAVIORAL } from "@/content/behavioral";
import { FLASHCARDS, MODULES, modulesByFormat } from "@/content/modules";
import { AI_PATHS, BASIC_CARD_COUNT, LESSON_COUNT } from "@/content/ai-interviews";
import { RN_CARDS } from "@/content/rn-cards";
import { RN_HUB } from "@/content/rn-hub";
import type { NavGroup } from "./nav-types";
import { MOBILE_HREF } from "./routes";
import { CODE } from "@/content/code-docs";
import { buildCatalog } from "./catalog";

/**
 * The single source for the menu and the landing page. Add a section here and it
 * appears everywhere; counts follow the content automatically.
 */
export function siteMap(): NavGroup[] {
  const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
  const reelCount = REELS.reduce((a, c) => a + c.reels.length, 0);
  const n = (f: Parameters<typeof modulesByFormat>[0]) => modulesByFormat(f).length;
  const problems = PATTERNS.length + Object.values(MORE_PROBLEMS).flat().length + n("coding-pattern");

  const rnPages = RN_HUB.flatMap((g) => g.items).length;

  /* Grouped by skill. Each page appears once, and each group reads from learning to practice. */
  return [
    {
      id: "ai",
      label: "AI engineering",
      short: "AI",
      blurb: "LLMs, retrieval, agents, evals and serving: learn the stack, then the parts.",
      items: [
        { href: "/aiengine", title: "Curriculum", desc: "A guided path through every phase.", icon: "compass", color: ["#ff5a1f", "#c2410c"], count: plural(PHASES.length, "phase") },
        { href: "/modules", title: "Modules", desc: "Serving, retrieval, fine-tuning, evals, infrastructure and mobile topics.", icon: "layers", color: ["#8b5cf6", "#d946ef"], count: plural(MODULES.length, "module") },
      ],
    },
    {
      id: "mobile",
      label: "Mobile engineering",
      short: "Mobile",
      blurb: "React Native and native: sync, state, memory, performance, and a two-week path.",
      items: [
        { href: "/paths/react-native", title: "React Native in one place", desc: "Architecture, state, memory, offline and budgets, in reading order.", icon: "phone", color: ["#0ea5e9", "#ff5a1f"], count: `${rnPages} pages` },
        { href: "/paths/mobile-principal", title: "Two weeks to mobile principal", desc: "One edit, followed end to end, then reused.", icon: "target", color: ["#f43f5e", "#ff5a1f"], count: "14 days" },
        { href: MOBILE_HREF, title: "All mobile pages", desc: "Every mobile module, round and exercise, filterable.", icon: "grid", color: ["#06b6d4", "#10b981"], count: plural(buildCatalog().filter((a) => a.domain === "mobile-systems").length, "page") },
        { href: "/mobile-coding", title: "Machine coding", desc: "Tested components, built and explained.", icon: "code", color: ["#14b8a6", "#6366f1"], count: plural(MOBILE_PROBLEMS.length + n("machine-coding"), "component") },
      ],
    },
    {
      id: "design",
      label: "System design",
      short: "Design",
      blurb: "Draw the system, then go inside a component, then down to the wire.",
      items: [
        { href: "/interview", title: "Design rounds", desc: "Timed mock rounds with a whiteboard.", icon: "board", color: ["#0ea5e9", "#ff5a1f"], count: plural(CASES.length + n("system-design"), "round") },
        { href: "/deep", title: "Deep dives", desc: "Component internals and state machines.", icon: "book", color: ["#8b5cf6", "#d946ef"], count: plural(DEEP.length + n("deep-dive"), "page") },
        { href: "/protocols", title: "Protocols", desc: "Wire-level packets and low-level mechanics.", icon: "network", color: ["#06b6d4", "#10b981"], count: plural(PROTOCOLS.length + n("protocol"), "lesson") },
      ],
    },
    {
      id: "interview",
      label: "Interview prep",
      short: "Interviews",
      blurb: "Prepare for AI-era rounds, then coding and behavioral questions.",
      items: [
        { href: "/paths/ai-interviews", title: "Crack AI interviews", desc: "Hacks, every new round, a plan and a project.", icon: "bolt", color: ["#f59e0b", "#c2410c"], count: `${AI_PATHS.length} paths · ${LESSON_COUNT} lessons` },
        { href: "/coding", title: "Coding patterns", desc: "Algorithm templates and worked problems.", icon: "spark", color: ["#10b981", "#0ea5e9"], count: plural(problems, "problem") },
        { href: "/problem-solving", title: "Behavioral", desc: "STAR answers, probes and red flags.", icon: "chat", color: ["#f59e0b", "#c2410c"], count: plural(ALL_BEHAVIORAL.length, "question") },
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

/** Honest totals for the landing page, counted from the content. */
export function siteStats() {
  return {
    pages: buildCatalog().length,
    code: Object.keys(CODE).length,
    cards: totalCritical() + FLASHCARDS.length + BASIC_CARD_COUNT + RN_CARDS.length,
  };
}
