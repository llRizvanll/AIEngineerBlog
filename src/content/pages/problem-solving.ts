/* Words for the problem-solving page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const PROBLEM_SOLVING_META: Metadata = {
  title: "Problem-solving interview questions",
  description: "33 behavioral problem-solving questions with STAR model answers, probes and red flags.",
};

export const PROBLEM_SOLVING_COPY = {
  kicker: "Behavioral round",
  title: { lead: "Problem-solving, ", accent: "answered." },
  intro: "Competency questions test how you think. Each has a STAR model answer, what the panel really tests, the follow-up probe and the red flags.",
  actions: {
    reels: { label: "Read as reels", href: "/reels/c-behavioral" },
    star: { label: "STAR in 60 seconds", href: "/reels/q-star" },
  },
  habits: { eyebrow: "Habits", title: "What makes an answer land" },
  source: {
    before: "Question list from ",
    after: "(questions 1–25). Questions marked “Engineering” are added for software roles. All model answers, probes and red flags are original.",
  },
  footer: "AI Engineer · problem-solving round",
};
