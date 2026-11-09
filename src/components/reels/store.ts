import { STORAGE } from "@/config/storage";
import type { ReelStore } from "./types";

/** Where the reader's likes, saves, finished reels and player settings are kept, and what a new reader starts with. */
export const REELS_STORE_KEY = STORAGE.reels;
export const EMPTY_REEL_STORE: ReelStore = {
  likes: {},
  saves: {},
  done: {},
  settings: { autoBeats: true, autoNext: true, captions: true, speed: 1, size: "m" },
};
