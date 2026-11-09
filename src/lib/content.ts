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
import { SITE, PART_ONE, SERIES_BLURBS } from "@/content/site";
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

export { routeFor } from "./routes";
export { SECTION_NAME, CASE_SHORT } from "@/content/ui-copy";

export const totalCritical = () => Object.values(CRITICAL).reduce((n, list) => n + list.length, 0);

export function readMinutes(c: ReelCollection): number {
  let words = 0;
  const w = (s?: string) => (s ? s.split(/\s+/).filter(Boolean).length : 0);
  c.reels.forEach((r) => {
    if (r.template === "read") r.pages.forEach((pg) => (words += w(pg.h) + w(pg.p) + w(pg.ex)));
  });
  return Math.max(1, Math.round(words / 230));
}
