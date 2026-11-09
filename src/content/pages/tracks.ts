/* Words for the tracks page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const TRACKS_META: Metadata = {
  title: "Tracks",
  description: "The order to learn each subject in: AI engineering, React Native, the two-week mobile path and AI interviews.",
  alternates: { canonical: "/tracks" },
};

export const TRACKS_COPY = {
  title: { lead: "Know what to learn ", accent: "next" },
  intro: "The order we would learn each subject in.",
  start: "Start",
  whole: "See the whole track",
  upNext: "Up next",
  /** One entry per track, in the order shown. `next` is the label on the "Up next" card. */
  tracks: [
    { name: "AI engineering", blurb: "For developers building products on language models.", next: "Start at phase 1" },
    { name: "React Native", blurb: "Architecture, state, memory, offline and budgets, in reading order.", next: "How it runs" },
    { name: "Mobile principal", blurb: "Fourteen days: one edit, followed end to end, then reused.", next: "Day 1" },
    { name: "AI interviews", blurb: "The hacks, the new rounds, a plan and a project.", next: "Never ask AI for the answer" },
  ],
};
