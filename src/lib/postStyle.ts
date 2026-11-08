import type { CSSProperties } from "react";

/** Each post gets its own palette, so the series never feels like one flat colour. */
export const POST_PALETTE: Record<string, [string, string, string]> = {
  "background-sync": ["#ff5a1f", "#c2410c", "#fbbf24"],
  sqlite: ["#0ea5e9", "#6366f1", "#22d3ee"],
  conflicts: ["#f97316", "#e11d48", "#facc15"],
  uploads: ["#10b981", "#0ea5e9", "#a3e635"],
  rn: ["#8b5cf6", "#06b6d4", "#f0abfc"],
  backend: ["#f43f5e", "#7c3aed", "#fb923c"],
  interview: ["#14b8a6", "#ff5a1f", "#fde047"],
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
