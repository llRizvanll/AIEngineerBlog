import type { Metadata } from "next";
import { REELS } from "@/lib/content";
import { ReelsPlayer } from "@/components/reels/ReelsPlayer";
import { summarize } from "@/lib/reel-summary";
import { REELS_PAGE_META } from "@/content/pages/reels";

export const metadata: Metadata = REELS_PAGE_META;

export default function ReelsPage() {
  return (
    <>
      <h1 className="sr-only">Reels: short lessons on AI and engineering</h1>
      <ReelsPlayer collections={REELS} summaries={REELS.map(summarize)} filter="all" />
    </>
  );
}
