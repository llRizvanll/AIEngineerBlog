import type { CSSProperties } from "react";
import { POST_PALETTE } from "@/config/constants";

export const palette = (id: string) => POST_PALETTE[id] ?? POST_PALETTE["background-sync"];

export const postVars = (id: string) => {
  const [a, b, c] = palette(id);
  return { "--pa": a, "--pb": b, "--pc": c } as CSSProperties;
};

export const hashNum = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
