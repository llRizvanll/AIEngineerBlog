import type { ArchDiagram, Pair } from "@/content/types";
import type { AssetFormat, CognitiveLevel, ComplexityTier, CurationMetadata, Domain } from "@/types/portal";

/** A full learning module. Every one renders with the same five parts. */
export interface ModuleDoc {
  assetId: string;
  title: string;
  domain: Domain;
  /** 1–11, see CURRICULUM; mobile-only topics have none */
  curriculum?: number;
  format: AssetFormat;
  cognitiveLevel: CognitiveLevel;
  complexityTier: ComplexityTier;
  minutes: number;
  curation: [CurationMetadata["curationStage"], CurationMetadata["pkmCycle"]];
  /** why this matters, in one front-loaded sentence */
  commentary: string;
  source: string;
  /** two slugs for the composite tags */
  topics: [string, string];

  /** Backward design: what the reader can do afterwards */
  outcome: string;
  /** The whole idea, in one short paragraph */
  epitome: string;
  concepts: Pair[];
  prompt: string;
  clarify?: Pair[];
  steps: Pair[];
  table?: { title: string; intro?: string; head: string[]; rows: string[][] };
  arch?: ArchDiagram;
  code?: { title: string; file: string; lang: "ts" | "python" | "bash" | "kotlin"; note?: string }[];
  qa: Pair[];
  further: Pair[];
}

/** A flashcard from the spec: front, back, why it matters and where it comes from. */
export interface FlashDoc {
  assetId: string;
  title: string;
  domain: Domain;
  curriculum: number;
  complexityTier: ComplexityTier;
  minutes: number;
  topics: [string, string];
  front: string;
  back: string;
  commentary: string;
  source: string;
}
