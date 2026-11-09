/* Words for the revise page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const REVISE_PAGE_META: Metadata = { title: "Flashcards: spaced recall", description: "Due cards return on schedule: incidents, probes, traps and AI systems recall." };

export const REVISE_PAGE_COPY = {
  title: { lead: "Practice that ", accent: "sticks" },
  /** Shown after the card count. */
  introTail: " cards that come back on schedule, aimed at what you miss.",
  today: {
    title: { lead: "Today's ", accent: "set" },
    text: "Answer out loud, flip, rate yourself. Hard cards return soon; easy ones wait longer.",
    start: "Start today's set",
    practice: { label: "Try the practice problems", href: "/practice" },
  },
  week: {
    label: "This week",
    days: ["M", "T", "W", "T", "F", "S", "S"],
    title: { lead: "A fresh ", accent: "week" },
    text: "A few minutes a day is what makes it stick.",
  },
  more: "More ways to practise",
  cardTag: "Practice",
  open: "Open",
  cards: [
    { href: "/paths/ai-interviews/basics", icon: "bolt", t: "Critical basics", d: "Read, memorise and practise the AI interview essentials." },
    { href: "/reels", icon: "play", t: "Reels", d: "One idea at a time, built for a phone and a spare minute." },
    { href: "/library", icon: "bookmark", t: "My progress", d: "Saved pages, your notes and exports." },
  ],
  groups: { basics: "AI interview basics", rn: "React Native at scale", ai: "AI systems" },
  footer: "AI Engineer · revise",
};
