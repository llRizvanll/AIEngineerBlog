/* Site-wide copy: the name and description, the series intro, and the text served to crawlers and AI tools. */

export const SITE = {
  name: "AI Engineer",
  author: "Rizvan",
  tagline: "AI engineering skills and interview prep",
  /** what a search result should say: the words people actually search for */
  seoTitle: "AI Engineer: learn AI skills and crack AI interviews",
  description:
    "A free AI engineering blog and interview prep site. Learn LLMs, RAG, AI agents, evals and system design with tested code, then practise AI-enabled coding rounds, mock interviews and flashcards.",
};

/** Part 1 of the series is a hand-written article (HTML + interactive widgets). */
export const PART_ONE = {
  id: "background-sync",
  num: "01",
  mins: 18,
  title: "Background sync for an app the OS will kill",
  dek: "Sync huge data sets and files on Android, iOS and React Native while the OS can stop your process at any moment. Includes a simulator, an interview-ready analogy, and a stack proven at millions of users.",
  tags: "Android · iOS · React Native · Backend",
  blurb:
    "Outbox, cursors, idempotency, resumable uploads, WorkManager, BGTaskScheduler, React Native. With a simulator you can break.",
  date: "Nov 3, 2026",
};

export const SERIES_BLURBS: Record<string, string> = {
  sqlite: "Schema, WAL, keyset paging, FTS5, migrations that survive users who stay offline for a month.",
  conflicts: "LWW, 409-merge, operations and CRDTs, chosen per entity, with the UI that goes with each.",
  uploads: "Multipart, presigned URLs, hashing, Range downloads and the iOS background URLSession rules.",
  rn: "Turbo Modules, native transfer managers and a shared KMP or Rust sync core.",
  backend: "Change logs, CDC, snapshots, push fan-out and protecting the API from its own clients.",
  interview: "System design prompts, decision stories and the questions panels use to test level.",
};

export const LLMS_ABOUT = "A free site for learning AI engineering and preparing for AI interviews: LLMs, RAG, agents, evals, model serving, mobile systems, protocols, coding patterns and system design. Lessons explain the basics first, and include tested code.";

export const LLMS_SECTIONS: [string, string][] = [
  ["Deep dive", "Deep dives"],
  ["Module", "AI systems modules"],
  ["Round", "System design rounds"],
  ["Protocol", "Protocols"],
  ["Pattern", "Coding patterns"],
  ["Mobile", "Machine coding"],
];
