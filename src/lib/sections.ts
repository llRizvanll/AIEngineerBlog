import { CASES, DEEP, PROTOCOLS, REELS, SERIES, totalCritical } from "./content";
import { PHASES } from "./curriculum";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { ALL_BEHAVIORAL } from "@/content/behavioral";
import type { NavGroup } from "./nav-types";

/**
 * The single source for the menu and the landing page. Add a section here and it
 * appears everywhere; counts follow the content automatically.
 */
export function siteMap(): NavGroup[] {
  const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
  const reelCount = REELS.reduce((a, c) => a + c.reels.length, 0);
  const problems = PATTERNS.length + Object.values(MORE_PROBLEMS).flat().length;

  return [
    {
      id: "learn",
      label: "Learn",
      blurb: "Understand how real systems work, one layer at a time.",
      items: [
        { href: "/aiengine", title: "Curriculum", desc: "A guided path through everything, phase by phase.", icon: "compass", color: ["#6c47ff", "#ec4899"], count: plural(PHASES.length, "phase") },
        { href: "/series", title: "Long reads", desc: "In-depth articles with diagrams and something to break.", icon: "book", color: ["#f97316", "#e11d48"], count: plural(SERIES.length, "article") },
        { href: "/deep", title: "Deep dives", desc: "Component internals, states, code and trade-offs.", icon: "layers", color: ["#8b5cf6", "#d946ef"], count: plural(DEEP.length, "page") },
        { href: "/protocols", title: "Protocols", desc: "Networking decoded packet by packet.", icon: "network", color: ["#06b6d4", "#10b981"], count: plural(PROTOCOLS.length, "lesson") },
      ],
    },
    {
      id: "practice",
      label: "Practice",
      blurb: "Rehearse every interview round with model answers.",
      items: [
        { href: "/interview", title: "System design", desc: "Timed mock rounds with a whiteboard and practice mode.", icon: "board", color: ["#0ea5e9", "#6c47ff"], count: plural(CASES.length, "round") },
        { href: "/coding", title: "Coding patterns", desc: "Recognise the pattern, apply the template, explain it.", icon: "code", color: ["#10b981", "#0ea5e9"], count: plural(problems, "problem") },
        { href: "/mobile-coding", title: "Machine coding", desc: "Build real components with tested, explained code.", icon: "phone", color: ["#14b8a6", "#6366f1"], count: plural(MOBILE_PROBLEMS.length, "component") },
        { href: "/problem-solving", title: "Behavioral", desc: "Structured answers, probes and red flags.", icon: "chat", color: ["#f59e0b", "#ec4899"], count: plural(ALL_BEHAVIORAL.length, "question") },
      ],
    },
    {
      id: "revise",
      label: "Revise",
      blurb: "Short formats for spare minutes and the night before.",
      items: [
        { href: "/reels", title: "Reels", desc: "Swipe through bite-sized lessons and animated code.", icon: "play", color: ["#f43f5e", "#f59e0b"], count: plural(reelCount, "reel") },
        { href: "/revise", title: "Flashcards", desc: "Incidents, probes and traps. Flip, shuffle, track.", icon: "cards", color: ["#a855f7", "#f43f5e"], count: plural(totalCritical(), "card") },
        { href: "/library", title: "My library", desc: "Saved pages and reading progress on this device.", icon: "bookmark", color: ["#22c55e", "#0ea5e9"] },
      ],
    },
  ];
}
