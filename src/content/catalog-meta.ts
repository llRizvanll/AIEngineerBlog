/* What the catalog needs to know about content that has no metadata of its own: domain, curriculum phase and a note per kind. */
import type { Domain } from "@/types/portal";

export const CASE_META: Record<string, { domain: Domain; curriculum?: number }> = {
  "offline-field": { domain: "mobile-systems" },
  chat: { domain: "mobile-systems" },
  feed: { domain: "mobile-systems" },
  payments: { domain: "mobile-systems" },
  booking: { domain: "mobile-systems" },
  release: { domain: "mobile-systems", curriculum: 11 },
  "ai-assistant": { domain: "agents-apps", curriculum: 6 },
  "on-device": { domain: "model-serving", curriculum: 1 },
  rag: { domain: "rag-retrieval", curriculum: 4 },
  "llm-serving": { domain: "model-serving", curriculum: 1 },
  "ai-evals": { domain: "evals-guardrails", curriculum: 7 },
};

export const DEEP_META: Record<string, { domain: Domain; curriculum?: number }> = {
  "llm-internals": { domain: "model-serving", curriculum: 1 },
  "inference-accel": { domain: "model-serving", curriculum: 1 },
  embeddings: { domain: "rag-retrieval", curriculum: 4 },
  "adapt-models": { domain: "fine-tuning", curriculum: 3 },
  "agents-mcp": { domain: "agents-apps", curriculum: 6 },
  "llm-integration": { domain: "agents-apps", curriculum: 10 },
  "ai-dev-accel": { domain: "agents-apps" },
};

export const COLLECTION_DOMAIN: Record<string, Domain> = {
  "c-aihb": "model-serving",
  "c-behavioral": "core-engineering",
  "c-patterns": "core-engineering",
  "q-coding-hacks": "core-engineering",
  "q-star": "core-engineering",
};

export const COLLECTION_CURRICULUM: Record<string, number> = { "c-aihb": 1 };

export const KIND_NOTE: Record<string, string> = {
  Incident: "Panels use incidents to test whether you stop the damage first.",
  Probe: "Probes test the mechanism behind the term, not just the term.",
  Trap: "Traps catch answers that sound right but fail in production.",
};
