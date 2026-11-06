import { EVALS } from "./evals";
import { FINE_TUNING } from "./fine-tuning";
import { AI_REELS, EXTRA, FLASHCARDS, INFRASTRUCTURE } from "./infrastructure";
import { MODEL_SERVING } from "./model-serving";
import { MOBILE_MODULES } from "./mobile";
import { RAG } from "./rag";
import type { ModuleDoc } from "./types";

export const MODULES: ModuleDoc[] = [...MODEL_SERVING, ...RAG, ...FINE_TUNING, ...EVALS, ...INFRASTRUCTURE, ...EXTRA, ...MOBILE_MODULES];
export const getModule = (id: string) => MODULES.find((m) => m.assetId === id);
export const modulesByFormat = (format: ModuleDoc["format"]) => MODULES.filter((m) => m.format === format);
export { AI_REELS, FLASHCARDS };
export type { FlashDoc, ModuleDoc } from "./types";
