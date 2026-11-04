import { ALL_BEHAVIORAL as BEHAVIORAL, BEHAVIORAL_TIPS, STAR, THEMES } from "@/content/behavioral";
import { COMPLEXITY, HACKS, METHOD, PATTERNS, SIGNAL_MAP, WORKED_BEATS } from "@/content/coding";

/** Reels have no room for trailing comments: the step notes explain the code instead. */
const stripComments = (code: string) => code.split("\n").map((l) => l.replace(/\s{2,}\/\/\s.*$/, ""));
import type { Reel, ReelCollection } from "@/content/types";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { kotlinLines } from "./mobile-source";

/* Reel collections generated from the problem-solving and coding sections. */

const themeName = (id: string) => THEMES.find((t) => t.id === id)?.title ?? id;

const behavioralReels: Reel[] = BEHAVIORAL.map((b) => ({
  id: "bq-" + b.id,
  title: b.q.length > 70 ? b.q.slice(0, 67) + "…" : b.q,
  template: "read",
  tags: [themeName(b.theme).toLowerCase().split(" ")[0], "behavioral"],
  pages: [
    { h: "The question", p: b.q, ex: b.testing, exLabel: "What they are testing" },
    { h: "Situation and task", p: `${b.s} ${b.t}` },
    { h: "What you did", p: b.a.map((x, i) => `**${i + 1}.** ${x}`).join(" ") },
    { h: "The result", p: b.r, ex: b.principal, exLabel: "Why it lands at principal level" },
    { h: "The follow-up probe", p: `“${b.probe[0]}” ${b.probe[1]}`, ex: "Avoid: " + b.redFlags.join(" · "), exLabel: "Red flags" },
  ],
  cta: { label: "Open the full answer", post: "problem-solving", section: "bq-" + b.id },
}));

/** Long snippets (a hand-written heap, a trie class…) would shrink to an unreadable size in a reel:
    show a window around each step's lines instead, with real line numbers. */
const LONG = 24;
type Beat = { hl?: number[]; note?: string; window?: [number, number] };
function windowed(lines: string[], beats: Beat[]): { beats: Beat[]; firstLine?: number } {
  if (lines.length <= LONG) return { beats };
  const last = lines.length - 1;
  return {
    firstLine: 1,
    beats: beats.map((b) => {
      if (!b.hl?.length) return { ...b, window: [0, Math.min(last, LONG - 4)] as [number, number] };
      const lo = Math.min(...b.hl), hi = Math.max(...b.hl);
      return { ...b, window: [Math.max(0, lo - 2), Math.min(last, hi + 2)] as [number, number] };
    }),
  };
}

const patternReels: Reel[] = PATTERNS.flatMap((p): Reel[] => [
  {
    id: "pat-" + p.id,
    title: p.name + ": spot it, crack it",
    template: "read",
    tags: ["pattern", "coding"],
    pages: [
      { h: "When you see…", p: p.signals.map((s) => "**" + s + "**").join(" · "), ex: p.tagline, exLabel: "The pattern" },
      { h: "The idea", p: p.idea, ex: p.complexity, exLabel: "Complexity" },
      { h: "Worked: " + p.worked.problem, p: p.worked.prompt + " " + p.worked.approach.join(" ") },
      { h: "Practise next", p: p.practice.map((x) => `**${x.name}** (${x.level}): ${x.hint}`).join(" ") },
      { h: "Traps", p: p.pitfalls.join(". ") + "." },
    ],
    cta: { label: "Open the pattern", post: "coding-" + p.id },
  },
  {
    id: "pat-solve-" + p.id,
    title: p.worked.problem + " · quick solution",
    template: "code",
    kicker: "Problem · " + p.name,
    heading: p.worked.problem,
    problem: p.worked.prompt,
    lang: "ts",
    lines: stripComments(p.worked.code),
    ...windowed(p.worked.code.split("\n"), [{ hl: [], note: "Read the problem. Which signal points to " + p.name.toLowerCase() + "?" }, ...(WORKED_BEATS[p.id] ?? [])]),
    beatMs: [5000, ...(WORKED_BEATS[p.id] ?? []).map(() => 6500)],
    tags: [p.name.toLowerCase(), "solution"],
    cta: { label: "Full walkthrough", post: "coding-" + p.id, section: "pt-worked" },
  },
  {
    id: "pat-code-" + p.id,
    title: p.name + " template",
    template: "code",
    kicker: "Template · " + p.name,
    heading: p.template.title,
    problem: "The reusable shape behind every " + p.name.toLowerCase() + " problem. Memorise it, then adapt the twist.",
    lang: "ts",
    lines: stripComments(p.template.code),
    ...windowed(p.template.code.split("\n"), p.template.beats),
    tags: ["template", "typescript"],
    beatMs: 5600,
    cta: { label: "Open the pattern", post: "coding-" + p.id },
  },
  ...(MORE_PROBLEMS[p.id] ?? []).map(
    (m, k): Reel => ({
      id: `pat-more-${p.id}-${k}`,
      title: m.problem + " · quick solution",
      template: "code",
      kicker: `${m.level} · ${p.name}`,
      heading: m.problem,
      problem: m.prompt,
      lang: "ts",
      lines: stripComments(m.code),
      ...windowed(m.code.split("\n"), [{ hl: [], note: m.approach[0] }, ...m.beats]),
      beatMs: [5000, ...m.beats.map(() => 6500)],
      tags: [p.name.toLowerCase(), "solution"],
      cta: { label: "Full walkthrough", post: "coding-" + p.id, section: "pt-more" },
    })
  ),
]);

/** Kotlin: drop trailing `// …` comments in reels; the step notes carry the explanation. */
const stripTrailingComments = (lines: string[]) => lines.map((l) => (l.trimStart().startsWith("//") ? l : l.replace(/\s{2,}\/\/.*$/, "")));

const mobileReels: Reel[] = MOBILE_PROBLEMS.flatMap((p): Reel[] => {
  const lines = stripTrailingComments(kotlinLines(p.file));
  const last = lines.length - 1;
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  return [
    {
      id: "mc-" + p.id,
      title: p.title,
      template: "read",
      tags: ["mobile", "machine coding"],
      pages: [
        { h: "The prompt", p: p.prompt, ex: p.requirements.join(" · "), exLabel: "Requirements" },
        { h: "Ask first", p: p.clarify.map(([q, a]) => `**${q}** ${a}`).join(" ") },
        { h: "The design", p: p.design.map(([h, d]) => `**${h}.** ${d}`).join(" ") },
        { h: "Edge cases", p: p.edgeCases.join(". ") + ".", ex: p.complexity, exLabel: "Complexity" },
        { h: "Follow-up", p: `“${p.followups[0][0]}” ${p.followups[0][1]}`, ex: p.ios.map(([k, v]) => `${k}: ${v}`).join(" · "), exLabel: "On iOS" },
      ],
      cta: { label: "Open the full solution", post: "mobile-" + p.id },
    },
    {
      id: "mc-code-" + p.id,
      title: p.title + " · the code",
      template: "code",
      kicker: `${p.level} · ${p.file}.kt`,
      heading: p.title,
      problem: p.tagline,
      lang: "kotlin",
      lines,
      firstLine: 1,
      beats: p.steps.map((st) => ({
        hl: range(st.lines[0], st.lines[1]),
        note: `${st.title}. ${st.note}`,
        window: [Math.max(0, st.lines[0] - 2), Math.min(last, st.lines[1] + 2)] as [number, number],
      })),
      beatMs: p.steps.map(() => 7000),
      tags: ["kotlin", "walkthrough"],
      cta: { label: "Open the full solution", post: "mobile-" + p.id, section: "mc-walk" },
    },
  ];
});

export const PREP_REELS: ReelCollection[] = [
  {
    id: "c-behavioral",
    group: "learn",
    title: "Problem-solving answers",
    blurb: "Twenty-five behavioral questions as STAR answers you can read in a minute each.",
    theme: { bg: "#160f1f", fg: "#f7f1ff", accent: "#ff8a5c", muted: "#b3a3c4" },
    reels: behavioralReels,
  },
  {
    id: "c-patterns",
    group: "learn",
    title: "Coding patterns",
    blurb: "Fifteen patterns, 45 worked problems: spot the signal, watch each solution line by line, then the template.",
    theme: { bg: "#0b1424", fg: "#eef5ff", accent: "#5cc8ff", muted: "#93a9c4" },
    reels: patternReels,
  },
  {
    id: "c-mobile",
    group: "learn",
    title: "Mobile machine coding",
    blurb: "Caches, image loading, offline sync, retries, paging and uploads: the design, then the Kotlin code step by step.",
    theme: { bg: "#0f1220", fg: "#f1f3ff", accent: "#ff7ab6", muted: "#a3a8c8" },
    reels: mobileReels,
  },
  {
    id: "q-coding-hacks",
    group: "quick",
    title: "Coding hacks and tricks",
    blurb: "The method, the constraint cheat sheet and the tools that save minutes.",
    theme: { bg: "#11131f", fg: "#f2f3ff", accent: "#b38cff", muted: "#a2a5c4" },
    reels: [
      { id: "hack-method", title: "The six-step method", template: "steps", heading: "Every coding round, same six steps", items: METHOD.map(([h, p]) => ({ h, p })), tags: ["method"], cta: { label: "Open coding prep", post: "coding" } },
      { id: "hack-constraints", title: "Read the constraints first", template: "analogy", heading: "n tells you the target complexity", pairs: COMPLEXITY.map(([n, o, ex]) => [`${n}`, `${o} · ${ex}`] as [string, string]), tags: ["complexity"] },
      { id: "hack-signals", title: "Signal → pattern", template: "analogy", heading: "Hear this, reach for that", pairs: SIGNAL_MAP.slice(0, 8).map(([s, p]) => [s, p] as [string, string]), tags: ["patterns"] },
      { id: "hack-signals-2", title: "Signal → pattern, part 2", template: "analogy", heading: "Hear this, reach for that", pairs: SIGNAL_MAP.slice(8).map(([s, p]) => [s, p] as [string, string]), tags: ["patterns"] },
      { id: "hack-ts", title: "TypeScript power tools", template: "steps", heading: "Idioms that save minutes", items: HACKS[0].items.slice(0, 6).map(([h, p]) => ({ h, p })), tags: ["typescript"] },
      { id: "hack-bugs", title: "Bugs that cost offers", template: "steps", heading: "Check these before you say done", items: HACKS[2].items.map(([h, p]) => ({ h, p })), tags: ["bugs"] },
      { id: "hack-quiz-1", title: "Quick check: constraints", template: "quiz", q: "n is up to 20 and you need every valid selection. What fits?", options: ["Two pointers", "Bitmask / backtracking, O(2ⁿ)", "Binary search", "Union-find"], answer: 1, why: "2²⁰ is about a million: exponential is fine at this size.", tags: ["quiz"] },
      { id: "hack-quiz-2", title: "Quick check: signals", template: "quiz", q: "“Smallest capacity such that all packages ship within D days.” Which pattern?", options: ["Sliding window", "Heap", "Binary search on the answer", "Topological sort"], answer: 2, why: "‘Smallest X such that…’ with a monotonic feasibility check is binary search on the answer.", tags: ["quiz"] },
      { id: "hack-quiz-3", title: "Quick check: BFS", template: "quiz", q: "When should BFS mark a cell visited?", options: ["When it is popped", "When it is pushed", "Only at the goal", "Never in a grid"], answer: 1, why: "Marking on push stops the same cell entering the queue many times.", tags: ["quiz"] },
    ],
  },
  {
    id: "q-star",
    group: "quick",
    title: "STAR in 60 seconds",
    blurb: "How to structure any behavioral answer, and the habits that make it land.",
    theme: { bg: "#1a1010", fg: "#fff4ef", accent: "#ffb347", muted: "#c4a99b" },
    reels: [
      { id: "star-shape", title: "The STAR shape", template: "steps", heading: "Four beats, two minutes", items: STAR.map(([h, p]) => ({ h, p })), tags: ["star"], cta: { label: "Open problem-solving prep", post: "problem-solving" } },
      { id: "star-tips", title: "What panels listen for", template: "steps", heading: "Make the story land", items: BEHAVIORAL_TIPS.slice(0, 4).map(([h, p]) => ({ h, p })), tags: ["tips"] },
      { id: "star-hook", title: "The one rule", template: "hook", kicker: "Behavioral rounds", lines: ["Real story.", "Your actions.", "A number at the end."], accent: "number", tags: ["star"] },
      { id: "star-quiz", title: "Quick check", template: "quiz", q: "Which part of a STAR answer should take the most time?", options: ["Situation", "Task", "Action", "Result"], answer: 2, why: "The panel scores what you did and how you thought. Keep context short.", tags: ["quiz"] },
    ],
  },
];
