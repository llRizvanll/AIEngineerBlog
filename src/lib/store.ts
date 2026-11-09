"use client";
import { STORAGE, STORE_EVENT } from "@/config/storage";

import { useCallback, useEffect, useState } from "react";
import { SRS_DAYS, DAY_MS } from "@/config/constants";

/* Tiny localStorage store with cross-component sync. Progress, notes and saves stay in this browser. */

const EVT = STORE_EVENT;

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
  } catch {
    /* storage full or disabled */
  }
}

/** Returns [value, update, hydrated]. Value is `fallback` until the first client effect runs. */
export function useLocal<T extends object>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readLocal(key, fallback));
    setHydrated(true);
    const onChange = (e: Event) => {
      const k = (e as CustomEvent).detail ?? (e as StorageEvent).key;
      if (k === key) setValue(readLocal(key, fallback));
    };
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (fn: (prev: T) => T) => {
      const next = fn(readLocal(key, fallback));
      writeLocal(key, next);
      setValue(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  return [value, update, hydrated] as const;
}

/* ---- shared stores ---- */

export interface LibraryState {
  saved: Record<string, { title: string; kind: string; at: number }>;
  seen: Record<string, { title: string; kind: string; at: number; pct?: number }>;
  /** Your own words on a page: the "sense" step of seek, sense, share */
  notes: Record<string, { title: string; kind: string; at: number; text: string }>;
}
export const LIBRARY_KEY = STORAGE.library;
export const emptyLibrary: LibraryState = { saved: {}, seen: {}, notes: {} };

export const PROGRAMME_KEY = STORAGE.programme;
export interface ProgrammeState {
  /** "4:/deep/sync-engine" */
  items: Record<string, boolean>;
  /** "8:2" */
  rubric: Record<string, boolean>;
  /** day number */
  done: Record<string, boolean>;
}
export const emptyProgramme: ProgrammeState = { items: {}, rubric: {}, done: {} };

export const AI_PATHS_KEY = STORAGE.aiPaths;
export interface AiPathsState {
  /** "rounds/rag-round" */
  done: Record<string, boolean>;
  /** "rounds/rag-round:2" */
  rubric: Record<string, boolean>;
  /** drill id to times completed */
  drills: Record<string, number>;
}
export const emptyAiPaths: AiPathsState = { done: {}, rubric: {}, drills: {} };

/** Leitner spaced repetition: each card sits in a box, and each box waits longer. */
export interface SrsCard {
  box: number;
  due: number;
  reviews: number;
}
export interface SrsState {
  cards: Record<string, SrsCard>;
}
export const SRS_KEY = STORAGE.srs;
export const emptySrs: SrsState = { cards: {} };

import type { Rating } from "@/types/ui";
export type { Rating };

export function nextSrs(prev: SrsCard | undefined, rating: Rating, now: number): SrsCard {
  const box = prev?.box ?? 0;
  const reviews = (prev?.reviews ?? 0) + 1;
  if (rating === "again") return { box: 0, due: now + 10 * 60_000, reviews };
  const next = Math.min(box + (rating === "easy" ? 2 : 1), SRS_DAYS.length - 1);
  return { box: next, due: now + SRS_DAYS[next] * DAY_MS, reviews };
}

export const intervalLabel = (prev: SrsCard | undefined, rating: Rating): string => {
  if (rating === "again") return "10 min";
  const box = Math.min((prev?.box ?? 0) + (rating === "easy" ? 2 : 1), SRS_DAYS.length - 1);
  const days = SRS_DAYS[box];
  return days === 1 ? "1 day" : `${days} days`;
};

export interface InterviewState {
  notes: Record<string, Record<string, string>>;
  done: Record<string, boolean>;
  boards: Record<string, unknown[]>;
  practice: boolean;
  crit: Record<string, boolean>;
}
export const INTERVIEW_KEY = STORAGE.interview;
export const emptyInterview: InterviewState = { notes: {}, done: {}, boards: {}, practice: false, crit: {} };

export interface Prefs {
  theme: "system" | "light" | "dark" | "sepia";
  size: number;
  leading: number;
  palette: string;
  uiFont: string;
  readFont: string;
  codeFont: string;
}
export const PREFS_KEY = STORAGE.prefs;
export const defaultPrefs: Prefs = {
  theme: "system",
  size: 19,
  leading: 1.65,
  palette: "aurora",
  uiFont: "figtree",
  readFont: "sourceserif",
  codeFont: "jetbrains",
};
