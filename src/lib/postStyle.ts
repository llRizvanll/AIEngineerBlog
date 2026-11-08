import type { CSSProperties } from "react";

/** Each post gets its own palette, so the series never feels like one flat colour. */
export const POST_PALETTE: Record<string, [string, string, string]> = {
  "background-sync": ["#f4d6c6", "#efc1a8", "#fff0e6"],
  sqlite: ["#cfe0ec", "#b9d0e4", "#eef5fa"],
  conflicts: ["#efd9a6", "#e8c987", "#fbf1d4"],
  uploads: ["#cfe5d5", "#b6d7c1", "#eef7f0"],
  rn: ["#dcd3ec", "#c8bce3", "#f1edf8"],
  backend: ["#ecc9cf", "#e0b0b9", "#f8e9ec"],
  interview: ["#c9e3df", "#b1d6d0", "#e9f5f3"],
};

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
