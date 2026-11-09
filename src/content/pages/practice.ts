/* Words for the practice page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const PRACTICE_META: Metadata = {
  title: "Practice",
  description: "Short problems with a checkable answer, at three levels, with the working shown. Plus flashcards and critical basics.",
  alternates: { canonical: "/practice" },
};

export const PRACTICE_COPY = {
  title: { lead: "Practice that ", accent: "sticks" },
  /** Shown after the problem count. */
  introTail: " problems with answers checked for you, then flashcards that come back on schedule.",
  more: "Keep it fresh",
  cardTag: "Practice",
  open: "Open",
  cards: [
    { href: "/revise", icon: "cards", t: "Flashcards", d: "Spaced recall: hard cards return soon, easy ones wait." },
    { href: "/paths/ai-interviews/basics", icon: "bolt", t: "Critical basics", d: "Read, memorise and practise the AI interview essentials." },
    { href: "/reels", icon: "play", t: "Reels", d: "One idea at a time, built for a phone and a spare minute." },
  ],
};
