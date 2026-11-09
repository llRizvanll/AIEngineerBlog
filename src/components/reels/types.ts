import type { Reel, ReelCollection } from "@/content/types";

/** A reel together with the collection it belongs to. */
export interface Item {
  r: Reel;
  c: ReelCollection;
}

export interface ReelStore {
  likes: Record<string, boolean>;
  saves: Record<string, boolean>;
  done: Record<string, boolean>;
  settings: { autoBeats: boolean; autoNext: boolean; captions: boolean; speed: number; size: "s" | "m" | "l" };
}

export interface Handlers {
  back: () => void;
  next: () => void;
  pause: () => void;
  act: (what: "like" | "save" | "share" | "cta", r: Reel) => void;
  pick: (id: string, v: number) => void;
}

export interface CardProps {
  x: Item;
  i: number;
  total: number;
  active: boolean;
  beat: number;
  p: number;
  paused: boolean;
  liked: boolean;
  saved: boolean;
  pick?: number;
  near: boolean;
  h: Handlers;
}
