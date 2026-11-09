/* Words and lists that belong to components: option labels, prompts, rubrics and legends. Not logic. */

import type { BasicsMode, PartKey, Rating, StudyMode } from "@/types/ui";

export const DIAGRAM_LEGEND: [string, string][] = [
  ["c", "Client"],
  ["s", "Service"],
  ["d", "Data store"],
  ["q", "Queue / stream"],
  ["a", "AI component"],
  ["x", "External"],
];

export const STUDY_MODES: [StudyMode, string][] = [
  ["explain", "Explain it"],
  ["quiz", "Quiz me"],
  ["interview", "Interview"],
];

export const STUDY_PROMPTS: Record<StudyMode, string> = {
  explain:
    "Help me study the page below. Teach it step by step: the basics in plain words first, then the key ideas, then the code if there is any. After each part, check my understanding with one short question and wait for my answer. Say clearly when something goes beyond the page or when you're unsure.",
  quiz: "Quiz me on the page below. Ask one question at a time and wait for my answer. Tell me what I got right and what I missed, then ask the next one. Start easy and get harder. After 8 questions, list my weak spots.",
  interview:
    "Act as a senior technical interviewer. Use the page below as the topic. Ask me one interview question at a time, probe weak answers before moving on, and don't give me the answers during the round. When I say 'end', score me from 1 to 5 and say what to study next.",
};

export const CASE_RUBRIC: [string, string][] = [
  ["Requirements", "Asked clarifying questions and stated assumptions."],
  ["Numbers", "Estimated scale and used it to make a decision."],
  ["Architecture", "Clear components with responsibilities and data flow."],
  ["Depth", "Went deep on the hardest part with real mechanisms."],
  ["Trade-offs", "Named alternatives and why they lost."],
  ["Operations", "Covered failures, monitoring and rollout."],
  ["Leadership", "Explained how the team would build and evolve it."],
];

export const CASE_PHASES: [string, number][] = [
  ["Clarify", 0.1],
  ["Estimate", 0.1],
  ["High-level design", 0.25],
  ["Deep dive", 0.35],
  ["Trade-offs and wrap-up", 0.2],
];

export const RATINGS: [Rating, string][] = [
  ["again", "Again"],
  ["good", "Good"],
  ["easy", "Easy"],
];

export const BASICS_MODES: [BasicsMode, string][] = [
  ["read", "Read"],
  ["memorise", "Memorise"],
  ["practise", "Practise"],
];

export const PROMPT_ROUNDS: Record<string, string> = {
  "AI-allowed coding": "an AI-allowed live coding round. Give me one multi-stage problem in a small codebase, and let me ask you for code as my assistant, but challenge anything I accept without checking",
  "Code comprehension": "a code comprehension round. Show me about 40 lines of unfamiliar code with hidden bugs, and ask me to explain it, find what's wrong and fix it",
  "LLM fundamentals": "an LLM fundamentals screen. Cover tokens, context limits, embeddings, caching, hallucination, prompt injection and cost sums",
  "RAG design": "a RAG system design round. Start with a vague product request, and probe chunking, search, permissions, metrics and failure handling",
  "Agent design": "an agent design round. Probe stop conditions, tool risk, approvals, retries, prompt injection and how I'd evaluate it",
  "Evals": "an evals round. Give me a feature and have me design the eval before any prompt. Probe failure modes, rubric precision, data coverage and judge validation",
  "Customer conversation": "a customer conversation role-play. Play a busy, non-technical customer who says the AI product feels dumb, and only give an example if I ask for one",
  Behavioural: "a behavioural round about AI work. Ask for specific examples, then push on what I personally did, what I measured and what went wrong",
};

export const PROMPT_STYLES: Record<string, string> = {
  Tough: "Be demanding, and don't reassure me.",
  Balanced: "Be fair and professional.",
  Friendly: "Be warm, but still don't give me answers.",
};

export const CODE_PROOF: Record<string, string> = {
  kt: "Compiled and tested by npm run test:mobile.",
  ts: "Tested by npm run test:modules.",
  py: "Syntax-checked. The GPU libraries it needs don't run in our tests.",
  sbatch: "Syntax-checked only.",
};

export const SECTION_NAME: Record<string, string> = {
  simple: "Use case",
  clarify: "Clarify",
  estimate: "Estimate",
  arch: "Architecture",
  flow: "Flow",
  fe: "Front end",
  api: "Data and APIs",
  deep: "Deep dives",
  trade: "Trade-offs",
  fail: "Failure modes",
};

export const CASE_SHORT: Record<string, string> = {
  "offline-field": "Offline field app",
  chat: "Chat",
  feed: "Feed",
  payments: "Payments",
  booking: "Booking",
  release: "Release platform",
  "ai-assistant": "AI assistant",
  "on-device": "On-device AI",
  rag: "RAG",
  "llm-serving": "LLM serving",
  "ai-evals": "AI evals",
};

export const PART_TITLES: Record<PartKey, string> = {
  basics: "Basics",
  question: "Question",
  detail: "Detailed answer",
  qa: "Q&A",
  more: "Extra depth",
};

export const LIBRARY_COPY = {
  savedTitle: "Seek: saved pages",
  savedEmpty: "Nothing saved yet. Tap ☆ Save on any article, round or module.",
  notesTitle: "Sense: your notes",
  notesEmpty: "No notes yet. Writing one thing in your own words is what makes it stick.",
  historyTitle: "Reading history",
  historyEmpty: "Open a post, round or module and it shows up here.",
};

export const CATALOG_COPY = {
  failed: "The catalog failed to load. Refresh to try again.",
  empty: "Nothing matches. Remove a filter or try another word.",
};

export const KEEP_READING_COPY = {
  eyebrow: "Continue",
  title: "Pick up where you left off",
};

export const PAGE_END_COPY = {
  note: "These links open public pages outside this site. Check dates and versions before relying on a detail.",
};

export const READING_COPY = {
  notePlaceholder: "In your own words: what did this change, and where will you use it?",
  noteHint: "Saved on this device. Find every note in My library.",
};

export const SHELL_COPY = {
  searchLabel: "Search lessons and projects",
  searchAria: "Search everything",
  themeAria: "Switch between light and dark",
};

export const RUNNER_COPY = {
  pickHint: "Pick a level. You can change it any time.",
  checked: "Each answer is checked for you, with the working shown.",
};

export const CURRICULUM_COPY = {
  kicker: "AIEngine",
  start: "Start the two-week programme →",
  pathsTitle: "Learning paths",
  pathsHint: "each step says why it comes next",
  aiTitle: "Crack AI interviews",
  aiBlurb: "Four connected paths: AI interview hacks, every new round, a study plan with a final stretch with AI off, and a mock interviewer you build yourself. Plus critical basics to memorise.",
  openPaths: "Open the paths →",
  basics: "Critical basics",
  programmeTitle: "Mobile principal in two weeks",
  openProgramme: "Open the programme →",
  lessonsOpened: "lessons opened",
  roundsPractised: "rounds practised",
  qaAnswered: "critical Q&A answered",
  terms: "glossary terms",
  noTerms: "No terms match.",
  loopTitle: "How each lesson works",
  loopHint: "the loop",
  readTitle: "Read",
  readText: "The problem, the analogy and the mechanism, in plain words.",
  drawTitle: "Draw",
  drawText: "Diagrams for architecture and flow that you can redraw from memory.",
  answerTitle: "Answer",
  answerText: "Practice mode: write your answer, then compare with the model one.",
  reviseTitle: "Revise",
  reviseText: "Critical incident questions and flashcards, tracked in this browser.",
};
