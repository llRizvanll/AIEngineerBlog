"use client";

import { useCallback, useEffect, useState } from "react";

/* Tiny localStorage store with cross-component sync. Progress, notes and saves stay in this browser. */

const EVT = "pae-store";

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
}
export const LIBRARY_KEY = "pae-library";
export const emptyLibrary: LibraryState = { saved: {}, seen: {} };

export interface InterviewState {
  notes: Record<string, Record<string, string>>;
  done: Record<string, boolean>;
  boards: Record<string, unknown[]>;
  practice: boolean;
  crit: Record<string, boolean>;
}
export const INTERVIEW_KEY = "pae-interview";
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
export const PREFS_KEY = "pae-prefs";
export const defaultPrefs: Prefs = {
  theme: "system",
  size: 19,
  leading: 1.65,
  palette: "aurora",
  uiFont: "geist",
  readFont: "sourceserif",
  codeFont: "geistmono",
};
