import { CASES, DEEP, POSTS, PROTOCOLS, REELS, PART_ONE, SERIES_BLURBS } from "./content";
import { DAYS } from "@/content/programme/mobile-principal";
import { GLOSSARY } from "./curriculum";
import { ALL_BEHAVIORAL as BEHAVIORAL } from "@/content/behavioral";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { FLASHCARDS, MODULES } from "@/content/modules";
import { AI_PATHS, BASICS, allLessons } from "@/content/ai-interviews";
import { basicKey } from "@/content/ai-interviews/basics";

export interface SearchItem {
  href: string;
  title: string;
  kind: "Post" | "Round" | "Deep dive" | "Protocol" | "Reels" | "Term" | "Page" | "Pattern" | "Problem" | "Mobile" | "Behavioral" | "Module" | "Flashcard";
  summary: string;
  /** extra words that should match but are not shown */
  keywords: string;
}

const trim = (s: string, n = 140) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [
    { href: "/paths/mobile-principal", title: "Mobile principal in two weeks", kind: "Page", summary: "A 14-day programme that follows one offline edit end to end.", keywords: "path plan programme schedule priya offline" },
    ...DAYS.map((d) => ({ href: `/paths/mobile-principal/day/${d.n}`, title: `Day ${d.n}: ${d.title}`, kind: "Page" as const, summary: d.question, keywords: `programme ${d.stop}` })),
    { href: "/paths/ai-interviews", title: "Crack AI interviews", kind: "Page", summary: "AI interview hacks, every round, a plan, and a mock interviewer to build.", keywords: "ai interview prep hacks rounds meta canva google coding rag agents evals mock" },
    { href: "/paths/ai-interviews/basics", title: "Critical basics for AI interviews", kind: "Page", summary: "Read, memorise and practise the essentials.", keywords: "basics flashcards memorise drills fundamentals llm rag agents evals prompting" },
    ...AI_PATHS.map((p) => ({ href: `/paths/ai-interviews/${p.id}`, title: p.title, kind: "Page" as const, summary: p.blurb, keywords: "ai interview path" })),
    ...allLessons().map(({ path, lesson }) => ({ href: `/paths/ai-interviews/${path.id}/${lesson.slug}`, title: lesson.title, kind: "Page" as const, summary: lesson.question, keywords: `${path.short} ${lesson.stop} ai interview ${lesson.words.map(([w]) => w).join(" ")}` })),
    ...BASICS.flatMap((b) => b.memorise.map((c, i) => ({ href: `/revise?card=${basicKey(b.id, i)}`, title: c.q, kind: "Flashcard" as const, summary: b.title, keywords: "ai interview basics" }))),
    { href: "/", title: "Home", kind: "Page", summary: "Start here: rounds, deep dives, reels and the series.", keywords: "start" },
    { href: "/aiengine", title: "AIEngine curriculum", kind: "Page", summary: "Guided phases, learning paths and a glossary.", keywords: "curriculum paths glossary learn" },
    { href: "/interview", title: "Interview room", kind: "Page", summary: "Mock rounds with a timer and a whiteboard.", keywords: "system design mock" },
    { href: "/deep", title: "Deep dives", kind: "Page", summary: "Under-the-hood pages for mobile and AI components.", keywords: "lld low level design handbook" },
    { href: "/protocols", title: "Protocol Explorer", kind: "Page", summary: "Fourteen protocols decoded packet by packet.", keywords: "network packets" },
    { href: "/revise", title: "Revise critical Q&A", kind: "Page", summary: "Critical incident questions as flashcards.", keywords: "flashcards incidents probes traps" },
    { href: "/reels", title: "Reels", kind: "Page", summary: "Read the portal like short-form cards.", keywords: "swipe courses" },
    { href: "/coding", title: "Coding patterns, hacks and tricks", kind: "Page", summary: "Fifteen patterns, the six-step method and the tricks that save minutes.", keywords: "leetcode algorithms dsa coding round typescript" },
    { href: "/coding#hacks", title: "Coding hacks and tricks", kind: "Page", summary: "TypeScript tools, edge cases, common bugs and how to talk through it.", keywords: "tips tricks typescript bugs" },
    { href: "/problem-solving", title: "Problem-solving interview questions", kind: "Page", summary: "25 behavioral questions with STAR model answers.", keywords: "behavioral competency star soft skills" },
    { href: "/library", title: "My library", kind: "Page", summary: "Saved pages, notes and exports.", keywords: "bookmarks saved notes export share" },
    { href: "/explore", title: "Explore the catalog", kind: "Page", summary: "Filter every asset by mode, domain, depth and time.", keywords: "filter catalog browse all" },
    { href: "/modules", title: "AI systems modules", kind: "Page", summary: "Serving, retrieval, fine-tuning, evals and infrastructure.", keywords: "vllm rag lora triton" },
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
  MODULES.forEach((m) =>
    items.push({ href: `/modules/${m.assetId}`, title: m.title, kind: "Module", summary: m.commentary, keywords: `${m.domain} ${m.format} ${m.topics.join(" ")} ${m.concepts.map(([c]) => c).join(" ")}` })
  );
  FLASHCARDS.forEach((f) => items.push({ href: `/revise?card=${f.assetId}`, title: f.title, kind: "Flashcard", summary: f.commentary, keywords: f.topics.join(" ") }));
  GLOSSARY.forEach(([t, d]) => items.push({ href: "/aiengine#glossary", title: t, kind: "Term", summary: d, keywords: "" }));
  return items;
}
