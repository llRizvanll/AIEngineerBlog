import { CASES, DEEP, POSTS, PROTOCOLS, REELS, PART_ONE, SERIES_BLURBS } from "./content";
import { GLOSSARY } from "./curriculum";
import { ALL_BEHAVIORAL as BEHAVIORAL } from "@/content/behavioral";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";

export interface SearchItem {
  href: string;
  title: string;
  kind: "Post" | "Round" | "Deep dive" | "Protocol" | "Reels" | "Term" | "Page" | "Pattern" | "Problem" | "Mobile" | "Behavioral";
  summary: string;
  /** extra words that should match but are not shown */
  keywords: string;
}

const trim = (s: string, n = 140) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [
    { href: "/", title: "Home", kind: "Page", summary: "Start here: rounds, deep dives, reels and the series.", keywords: "start" },
    { href: "/aiengine", title: "AIEngine curriculum", kind: "Page", summary: "Ten phases, learning paths and a glossary.", keywords: "curriculum paths glossary learn" },
    { href: "/interview", title: "Interview room", kind: "Page", summary: "Mock rounds with a timer and a whiteboard.", keywords: "system design mock" },
    { href: "/deep", title: "Deep dives", kind: "Page", summary: "Under-the-hood pages for mobile and AI components.", keywords: "lld low level design handbook" },
    { href: "/protocols", title: "Protocol Explorer", kind: "Page", summary: "Fourteen protocols decoded packet by packet.", keywords: "network packets" },
    { href: "/revise", title: "Revise critical Q&A", kind: "Page", summary: "Critical incident questions as flashcards.", keywords: "flashcards incidents probes traps" },
    { href: "/reels", title: "Reels", kind: "Page", summary: "Read the portal like short-form cards.", keywords: "swipe courses" },
    { href: "/coding", title: "Coding patterns, hacks and tricks", kind: "Page", summary: "Fifteen patterns, the six-step method and the tricks that save minutes.", keywords: "leetcode algorithms dsa coding round typescript" },
    { href: "/coding#hacks", title: "Coding hacks and tricks", kind: "Page", summary: "TypeScript tools, edge cases, common bugs and how to talk through it.", keywords: "tips tricks typescript bugs" },
    { href: "/problem-solving", title: "Problem-solving interview questions", kind: "Page", summary: "25 behavioral questions with STAR model answers.", keywords: "behavioral competency star soft skills" },
    { href: "/library", title: "My library", kind: "Page", summary: "Saved pages and reading progress.", keywords: "bookmarks saved" },
    { href: `/series/${PART_ONE.id}`, title: PART_ONE.title, kind: "Post", summary: PART_ONE.blurb, keywords: "part 1 workmanager bgtaskscheduler outbox simulator" },
  ];
  POSTS.forEach((p) =>
    items.push({ href: `/series/${p.id}`, title: p.title, kind: "Post", summary: SERIES_BLURBS[p.id] ?? trim(p.dek), keywords: `${p.tags} ${p.secs.map((s) => s.h).join(" ")}` })
  );
  CASES.forEach((c) =>
    items.push({ href: `/interview/${c.id}`, title: c.title, kind: "Round", summary: trim(c.prompt), keywords: `${c.track} ${c.tags.join(" ")}` })
  );
  DEEP.forEach((d) =>
    items.push({ href: `/deep/${d.id}`, title: d.title, kind: "Deep dive", summary: trim(d.summary), keywords: `${d.kicker} ${d.group}` })
  );
  PROTOCOLS.forEach((p) =>
    items.push({ href: `/protocols/${p.id}`, title: `${p.name} · ${p.full}`, kind: "Protocol", summary: p.tag, keywords: `${p.layer} ${p.port}` })
  );
  REELS.forEach((c) =>
    items.push({ href: `/reels/${c.id}`, title: `${c.title} reels`, kind: "Reels", summary: c.blurb, keywords: c.reels.map((r) => r.title).join(" ") })
  );
  PATTERNS.forEach((p) =>
    items.push({ href: `/coding/${p.id}`, title: `${p.name} pattern`, kind: "Pattern", summary: p.tagline, keywords: `${p.signals.join(" ")} ${p.worked.problem} ${p.practice.map((x) => x.name).join(" ")}` })
  );
  Object.entries(MORE_PROBLEMS).forEach(([pid, list]) =>
    list.forEach((m) =>
      items.push({ href: `/coding/${pid}#pt-more`, title: m.problem, kind: "Problem", summary: m.prompt, keywords: `${pid} ${m.level} typescript` })
    )
  );
  PATTERNS.forEach((p) =>
    items.push({ href: `/coding/${p.id}#pt-worked`, title: p.worked.problem, kind: "Problem", summary: p.worked.prompt, keywords: `${p.id} typescript` })
  );
  items.push({ href: "/mobile-coding", title: "Mobile machine coding", kind: "Page", summary: "Low-level design problems in tested Kotlin with iOS equivalents.", keywords: "lld android kotlin coroutines ios machine coding" });
  MOBILE_PROBLEMS.forEach((m) =>
    items.push({ href: `/mobile-coding/${m.id}`, title: m.title, kind: "Mobile", summary: m.tagline, keywords: `${m.tags.join(" ")} kotlin coroutines android ios` })
  );
  BEHAVIORAL.forEach((b) =>
    items.push({ href: `/problem-solving#bq-${b.id}`, title: b.q, kind: "Behavioral", summary: b.testing, keywords: b.theme })
  );
  GLOSSARY.forEach(([t, d]) => items.push({ href: "/aiengine#glossary", title: t, kind: "Term", summary: d, keywords: "" }));
  return items;
}
