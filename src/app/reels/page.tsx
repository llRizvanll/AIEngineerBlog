import type { Metadata } from "next";
import { REELS } from "@/lib/content";
import { ReelsPlayer } from "@/components/reels/ReelsPlayer";
import { summarize } from "@/lib/reel-summary";

export const metadata: Metadata = { title: "Reels", description: "Short, swipeable lessons on AI systems, mobile engineering, coding patterns and interview skills." };

export default function ReelsPage() {
  return (
    <>
      <h1 className="sr-only">Reels: short lessons on AI and engineering</h1>
      <ReelsPlayer collections={REELS} summaries={REELS.map(summarize)} filter="all" />
    </>
  );
}
