/* Tiny, data-free helpers that client components can import without pulling in the content JSON. */

/** Map the original app's hash targets ("case-chat", "deep-rag", "background-sync") to routes. */
export function routeFor(target: string, section?: string): string {
  const hash = section ? `#${section}` : "";
  if (target === "background-sync") return `/series/background-sync${hash}`;
  if (target.startsWith("post-")) return `/series/${target.slice(5)}${hash}`;
  if (target.startsWith("case-")) return `/interview/${target.slice(5)}${hash}`;
  if (target.startsWith("deep-")) return `/deep/${target.slice(5)}${hash}`;
  if (target.startsWith("proto-")) return `/protocols/${target.slice(6)}${hash}`;
  if (target.startsWith("reels-")) return `/reels/${target.slice(6)}`;
  if (target.startsWith("coding-")) return `/coding/${target.slice(7)}${hash}`;
  if (target.startsWith("mobile-")) return `/mobile-coding/${target.slice(7)}${hash}`;
  if (target.startsWith("module-")) return `/modules/${target.slice(7)}${hash}`;
  const simple: Record<string, string> = {
    home: "/",
    interview: "/interview",
    deep: "/deep",
    revise: "/revise",
    reels: "/reels",
    aiengine: "/aiengine",
    protocols: "/protocols",
    library: "/library",
    "problem-solving": "/problem-solving",
    coding: "/coding",
    "mobile-coding": "/mobile-coding",
  };
  return (simple[target] ?? "/") + hash;
}

/** Stable key for a round's flashcard. */
export const critKey = (caseId: string, sec: string, i: number) => `${caseId}|${sec}|${i}`;

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


export const PROGRAMME_HREF = "/paths/mobile-principal";
export const dayHref = (n: number) => `${PROGRAMME_HREF}/day/${n}`;

export const AI_PATHS_HREF = "/paths/ai-interviews";
export const AI_BASICS_HREF = `${AI_PATHS_HREF}/basics`;
export const aiPathHref = (path: string) => `${AI_PATHS_HREF}/${path}`;
export const aiLessonHref = (path: string, lesson: string) => `${AI_PATHS_HREF}/${path}/${lesson}`;
