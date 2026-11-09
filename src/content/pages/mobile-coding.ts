/* Words for the mobile-coding page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const MOBILE_CODING_META: Metadata = {
  title: "Mobile machine coding",
  description: "Low-level design and coding problems for mobile engineers, with tested Kotlin solutions and line-by-line explanations.",
};

export const MOBILE_CODING_COPY = {
  title: { lead: "Build it ", accent: "yourself" },
  intro: "Machine coding for mobile and AI engineers: caches, loaders, sync, retries and guards, with every solution explained line by line.",
  start: "Start with the LRU cache",
  /** The four proof tiles. The problem count is added by the page, so it has no entry here. */
  proof: [
    { value: null, label: "problems" },
    { value: "Kotlin 2", label: "coroutines and Flow" },
    { value: "68", label: "passing tests" },
    { value: "iOS", label: "equivalents for each" },
  ],
  round: { eyebrow: "How the round works", title: "45 minutes, one component" },
  steps: [
    ["Clarify", "Scope, scale, threading model, what is out of scope."],
    ["API first", "Write the public interface and the state it owns."],
    ["Core logic", "The happy path, then the concurrency story."],
    ["Edge cases", "Failure, cancellation, kills, duplicates."],
    ["Test it", "Show how you would test it with fakes."],
    ["Extend", "Priorities, persistence, metrics: talk trade-offs."],
  ],
  problems: { eyebrow: "Problems", title: "Pick a component", topics: "topics" },
  shelf: { title: "AI machine coding", blurb: "Kernels, adapters, guards, checkpoints" },
  footer: "AI Engineer · mobile machine coding",
};
