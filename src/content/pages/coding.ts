/* Words for the coding page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const CODING_META: Metadata = {
  title: "Coding patterns, hacks and tricks",
  description: "Fifteen coding interview patterns with templates, worked problems, practice lists and the tricks that save minutes.",
};

export const CODING_COPY = {
  kicker: "Coding round",
  title: { lead: "Crack the coding round with ", accent: "patterns." },
  intro: "Fifteen patterns cover most interview problems. Learn the signals, memorise a template, and spend the interview on the twist.",
  actions: {
    reels: { label: "Patterns as reels", href: "/reels/c-patterns" },
    mobile: { label: "Mobile machine coding", href: "/mobile-coding" },
    hacks: { label: "Hacks and tricks reels", href: "/reels/q-coding-hacks" },
  },
  method: { eyebrow: "The method", title: "Six steps, every round", time: "about 30 minutes" },
  patterns: { eyebrow: "Patterns", title: "Learn the fifteen" },
  mobileBand: {
    eyebrow: "Mobile machine coding · Kotlin · tested",
    title: "Build the components apps run on",
    /** Shown after the problem count. */
    textTail: " low-level design problems with production-style Kotlin, a line-by-line walkthrough, edge cases, follow-ups and the iOS equivalent.",
    go: "Open mobile machine coding",
  },
  signals: { eyebrow: "Hear this → reach for that", title: "Signal to pattern" },
  complexity: { eyebrow: "Read the constraints first", title: "Input size → target complexity" },
  hacks: { eyebrow: "Hacks and tricks", title: "The small things that save the round" },
  shelf: { title: "AI coding patterns", blurb: "RRF, DPO, RAGAS, speculative decoding" },
  footer: "AI Engineer · coding round",
};
