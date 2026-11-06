import type { Domain, PortalAsset, PortalMode } from "@/types/portal";
import { buildCatalog } from "./catalog";

export interface MapLayer {
  id: Domain;
  name: string;
  blurb: string;
  group: "path" | "around";
  counts: Record<PortalMode, number>;
  picks: Record<PortalMode, { title: string; href: string }[]>;
}

/* The whole system on one screen: one request from phone to GPU, and what surrounds it. */
const LAYERS: Omit<MapLayer, "counts" | "picks">[] = [
  { id: "mobile-systems", group: "path", name: "Mobile client", blurb: "Offline sync, uploads and streaming UI." },
  { id: "agents-apps", group: "path", name: "Agents and apps", blurb: "Prompts, tools and agent loops." },
  { id: "rag-retrieval", group: "path", name: "Retrieval", blurb: "Embeddings, hybrid search, reranking." },
  { id: "model-serving", group: "path", name: "Model serving", blurb: "KV cache, batching, attention kernels." },
  { id: "infrastructure", group: "path", name: "GPU infrastructure", blurb: "Schedulers, collectives, networks." },
  { id: "evals-guardrails", group: "around", name: "Evals and guardrails", blurb: "Judges, classifiers, red teams." },
  { id: "fine-tuning", group: "around", name: "Fine-tuning", blurb: "Adapters, preference training, sharding." },
  { id: "core-engineering", group: "around", name: "Core engineering", blurb: "Algorithms and behavioural rounds." },
];

const ORDER = ["long-read", "deep-dive", "coding-pattern", "machine-coding", "system-design", "protocol", "behavioral", "flashcard", "reel"];
const TIERS = ["tier1-epitome", "tier2-intermediate", "tier3-edge-cases"];
const score = (a: PortalAsset) => TIERS.indexOf(a.complexityTier) * 100 + ORDER.indexOf(a.format);

export function systemMap(): MapLayer[] {
  const all = buildCatalog();
  return LAYERS.map((layer) => {
    const inLayer = all.filter((a) => a.domain === layer.id);
    const of = (mode: PortalMode) => inLayer.filter((a) => a.mode === mode);
    const picks = (mode: PortalMode) =>
      [...of(mode)]
        .sort((a, b) => score(a) - score(b))
        .slice(0, 2)
        .map((a) => ({ title: a.title, href: a.href }));
    return {
      ...layer,
      counts: { learn: of("learn").length, practice: of("practice").length, revise: of("revise").length },
      picks: { learn: picks("learn"), practice: picks("practice"), revise: picks("revise") },
    };
  });
}

/** Learn, practice and revise counts for each of the 11 curriculum domains. */
export function curriculumCounts() {
  const all = buildCatalog();
  return (n: number) => {
    const inTopic = all.filter((a) => a.curriculum === n);
    const c = (mode: PortalMode) => inTopic.filter((a) => a.mode === mode).length;
    return { learn: c("learn"), practice: c("practice"), revise: c("revise") };
  };
}
