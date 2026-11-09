/* Every place the portal keeps something in the reader's browser, in one list.
   Changing a key here moves that data for everyone, so treat these as part of the public contract:
   rename only with a migration. Suffixes like -v1 mark a data shape that was changed once. */

export const STORAGE = {
  prefs: "pae-prefs",
  library: "pae-library",
  srs: "pae-srs",
  interview: "pae-interview",
  programme: "pae-programme-v1",
  aiPaths: "pae-ai-paths-v1",
  practice: "pae-practice-v1",
  reels: "pae-reels",
  behavioral: "pae-behavioral",
  protocols: "pae-proto",
  claps: "pae-claps",
  studyMode: "pae-study-mode",
  language: "pae-lang",
  bgSyncQuiz: "pae-bgsync-quiz",
} as const;

/** Kept for the length of one visit (sessionStorage), not across visits. */
export const SESSION = {
  aiReferrer: "pae-ai-ref",
} as const;

/** The event the local store fires when any value changes, so every component using it re-reads. */
export const STORE_EVENT = "pae-store";
