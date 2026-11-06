import casesJson from "@/content/cases.json";
import deepJson from "@/content/deep.json";
import feJson from "@/content/frontend.json";
import postsJson from "@/content/posts.json";
import protoJson from "@/content/protocols.json";
import critJson from "@/content/critical.json";
import reelsJson from "@/content/reels.json";
import type {
  CriticalQ,
  DeepDive,
  FrontEndNotes,
  InterviewCase,
  Post,
  Protocol,
  ReelCollection,
} from "@/content/types";

export const CASES = casesJson as unknown as InterviewCase[];
export const DEEP = deepJson as unknown as DeepDive[];
export const FRONTEND = feJson as unknown as Record<string, FrontEndNotes>;
export const POSTS = postsJson as unknown as Post[];
export const PROTOCOLS = protoJson as unknown as Protocol[];
export const CRITICAL = critJson as unknown as Record<string, CriticalQ[]>;
import { PREP_REELS } from "./prep-reels";
import { MODULE_REELS } from "./module-reels";
const BASE_REELS = reelsJson as unknown as ReelCollection[];
/** Prep collections sit after the interview-room course so they are easy to find. */
export const REELS: ReelCollection[] = [
  ...BASE_REELS.filter((c) => c.group === "learn").slice(0, 1),
  ...MODULE_REELS.filter((c) => c.group === "learn"),
  ...PREP_REELS.filter((c) => c.group === "learn"),
  ...BASE_REELS.filter((c) => c.group === "learn").slice(1),
  ...MODULE_REELS.filter((c) => c.group === "quick"),
  ...PREP_REELS.filter((c) => c.group === "quick"),
  ...BASE_REELS.filter((c) => c.group === "quick"),
];

export const SITE = {
  name: "AI Engineer",
  author: "Rizvan",
  tagline: "Mobile + AI systems · interview prep",
  description:
    "Mock interview rounds on mobile systems and AI. Draw the architecture, walk the flow, defend the trade-offs, then go one level deeper.",
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

export interface SeriesEntry {
  id: string;
  num: string;
  title: string;
  blurb: string;
  mins: number;
  href: string;
}

export const SERIES: SeriesEntry[] = [
  { id: PART_ONE.id, num: PART_ONE.num, title: PART_ONE.title, blurb: PART_ONE.blurb, mins: PART_ONE.mins, href: `/series/${PART_ONE.id}` },
  ...POSTS.map((p) => ({ id: p.id, num: p.num, title: p.title, blurb: SERIES_BLURBS[p.id] ?? p.dek, mins: p.mins, href: `/series/${p.id}` })),
];

export const getCase = (id: string) => CASES.find((c) => c.id === id);
export const getDeep = (id: string) => DEEP.find((d) => d.id === id);
export const getPost = (id: string) => POSTS.find((p) => p.id === id);
export const getProtocol = (id: string) => PROTOCOLS.find((p) => p.id === id);
export const getCollection = (id: string) => REELS.find((c) => c.id === id);

export { routeFor, SECTION_NAME, CASE_SHORT } from "./routes";

export const totalCritical = () => Object.values(CRITICAL).reduce((n, list) => n + list.length, 0);

export function readMinutes(c: ReelCollection): number {
  let words = 0;
  const w = (s?: string) => (s ? s.split(/\s+/).filter(Boolean).length : 0);
  c.reels.forEach((r) => {
    if (r.template === "read") r.pages.forEach((pg) => (words += w(pg.h) + w(pg.p) + w(pg.ex)));
  });
  return Math.max(1, Math.round(words / 230));
}
