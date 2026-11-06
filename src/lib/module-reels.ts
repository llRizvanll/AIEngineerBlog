import { AI_REELS, MODULES } from "@/content/modules";
import type { Reel, ReelCollection } from "@/content/types";

/* Every AI systems module also reads as a reel: the whole idea, the question, the steps, one Q&A. */
const moduleReels: Reel[] = MODULES.map((m) => ({
  id: `mod-${m.assetId}`,
  title: m.title,
  template: "read",
  tags: [m.topics[0], m.format],
  pages: [
    { h: "The whole idea", p: m.epitome, ex: m.commentary, exLabel: "Why it matters" },
    { h: "The question", p: m.prompt, ex: m.outcome, exLabel: "You will be able to" },
    ...m.steps.map(([h, p]) => ({ h, p })),
    { h: m.qa[0][0], p: m.qa[0][1], ex: m.further[m.further.length - 1][1], exLabel: m.further[m.further.length - 1][0] },
  ],
  cta: { label: "Open the module", post: `module-${m.assetId}` },
}));

export const MODULE_REELS: ReelCollection[] = [
  {
    id: "c-ai-systems",
    group: "learn",
    title: "AI systems",
    blurb: "Serving, retrieval, fine-tuning, evals, infrastructure and mobile platform topics, one module per reel.",
    theme: { bg: "#0e1022", fg: "#f1f2ff", accent: "#8f7bff", muted: "#a1a4c9" },
    reels: moduleReels,
  },
  {
    id: "q-ai-systems",
    group: "quick",
    title: "AI systems quick hits",
    blurb: "Vector filters, CUDA memory, hallucinations and factuality checks in a minute each.",
    theme: { bg: "#10131f", fg: "#f1f3ff", accent: "#5cd6c0", muted: "#9fb0bd" },
    reels: AI_REELS.map((r) => r.reel),
  },
];
