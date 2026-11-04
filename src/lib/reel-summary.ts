import type { ReelCollection } from "@/content/types";

/** Sidebar-only view of a collection: no reel bodies, so pages stay light. */
export interface CollectionSummary {
  id: string;
  title: string;
  group: "learn" | "quick";
  theme: ReelCollection["theme"];
  ids: string[];
}

export const summarize = (c: ReelCollection): CollectionSummary => ({
  id: c.id,
  title: c.title,
  group: c.group,
  theme: c.theme,
  ids: c.reels.map((r) => r.id),
});

