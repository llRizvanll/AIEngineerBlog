/* Metadata contract for every learning asset in the portal.
   Follows portal-asset-schema.json, with three extra domains and one extra format so that the
   mobile, agent and behavioural material has a home. */

export type Domain =
  | "infrastructure"
  | "model-serving"
  | "rag-retrieval"
  | "fine-tuning"
  | "evals-guardrails"
  | "agents-apps"
  | "mobile-systems"
  | "core-engineering";

export type PortalMode = "learn" | "practice" | "revise";

export type AssetFormat =
  | "long-read"
  | "deep-dive"
  | "protocol"
  | "coding-pattern"
  | "machine-coding"
  | "system-design"
  | "behavioral"
  | "flashcard"
  | "reel";

export type CognitiveLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
export type ComplexityTier = "tier1-epitome" | "tier2-intermediate" | "tier3-edge-cases";
export type DurationCategory = "micro:1-3m" | "standard:5-15m" | "deep:30m+";

export interface CurationMetadata {
  curationStage: "collect" | "categorize" | "critique" | "conceptualize" | "circulate";
  pkmCycle: "seek" | "sense" | "share";
  contextualCommentary: string;
  sourceAttribution?: string;
}

export interface PortalAsset {
  assetId: string;
  title: string;
  domain: Domain;
  mode: PortalMode;
  format: AssetFormat;
  cognitiveLevel: CognitiveLevel;
  complexityTier: ComplexityTier;
  estimatedDuration: { category: DurationCategory; minutes: number };
  curationMetadata: CurationMetadata;
  compositeTags: string[];
  /** where the asset opens */
  href: string;
  /** 1–11: which curriculum domain it belongs to, when it maps onto one */
  curriculum?: number;
}

export interface FilterState {
  searchQuery: string;
  domain?: Domain;
  mode?: PortalMode;
  format?: AssetFormat;
  cognitiveLevel?: CognitiveLevel;
  complexityTier?: ComplexityTier;
  durationCategory?: DurationCategory;
  selectedTag?: string;
  curriculum?: number;
}

export const DOMAIN_LABEL: Record<Domain, string> = {
  "mobile-systems": "Mobile systems",
  "agents-apps": "Agents and apps",
  "rag-retrieval": "RAG and retrieval",
  "model-serving": "Model serving",
  "fine-tuning": "Fine-tuning",
  "evals-guardrails": "Evals and guardrails",
  infrastructure: "Infrastructure",
  "core-engineering": "Core engineering",
};

export const MODE_LABEL: Record<PortalMode, string> = { learn: "Learn", practice: "Practice", revise: "Revise" };

export const FORMAT_LABEL: Record<AssetFormat, string> = {
  "long-read": "Long read",
  "deep-dive": "Deep dive",
  protocol: "Protocol",
  "coding-pattern": "Coding pattern",
  "machine-coding": "Machine coding",
  "system-design": "System design",
  behavioral: "Behavioral",
  flashcard: "Flashcard",
  reel: "Reel",
};

export const TIER_LABEL: Record<ComplexityTier, string> = {
  "tier1-epitome": "Tier 1 · Whole picture",
  "tier2-intermediate": "Tier 2 · Mechanisms",
  "tier3-edge-cases": "Tier 3 · Edge cases",
};

export const LEVEL_LABEL: Record<CognitiveLevel, string> = {
  remember: "Remember",
  understand: "Understand",
  apply: "Apply",
  analyze: "Analyze",
  evaluate: "Evaluate",
  create: "Create",
};

export const DURATION_LABEL: Record<DurationCategory, string> = {
  "micro:1-3m": "Micro · 1–3 min",
  "standard:5-15m": "Standard · 5–15 min",
  "deep:30m+": "Deep · 30+ min",
};

/** The spec's bands skip 4 and 16–29 minutes; those fall into the standard band. */
export function durationCategory(minutes: number): DurationCategory {
  if (minutes <= 3) return "micro:1-3m";
  return minutes >= 30 ? "deep:30m+" : "standard:5-15m";
}

/** The 11 curriculum domains. */
export const CURRICULUM: { n: number; title: string; terms: string }[] = [
  { n: 1, title: "Model serving and inference", terms: "PagedAttention, KV cache, vLLM, continuous batching" },
  { n: 2, title: "Distributed training", terms: "Data and tensor parallelism, DeepSpeed ZeRO, FSDP" },
  { n: 3, title: "Fine-tuning (PEFT)", terms: "LoRA, QLoRA, adapter merging, DPO, Unsloth" },
  { n: 4, title: "Vector search and RAG", terms: "HNSW, hybrid search, chunking, GraphRAG" },
  { n: 5, title: "GPU kernels and low-level systems", terms: "Triton, FlashAttention, memory traffic" },
  { n: 6, title: "AI agents", terms: "Tool calling, ReAct loops, state, orchestration" },
  { n: 7, title: "Evaluation and benchmarks", terms: "RAGAS, LLM-as-a-judge, eval gates" },
  { n: 8, title: "LLM safety and guardrails", terms: "Prompt injection, Llama Guard, schema validation" },
  { n: 9, title: "Multimodal systems", terms: "ViT, CLIP, visual reasoning benchmarks" },
  { n: 10, title: "Prompt engineering", terms: "Chain of thought, few-shot, structured output" },
  { n: 11, title: "MLOps and infrastructure", terms: "SLURM, Ray Serve, NCCL, checkpointing" },
];
