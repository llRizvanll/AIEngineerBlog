import type { Metadata } from "next";
import { REELS } from "@/lib/content";
import { ReelsPlayer } from "@/components/reels/ReelsPlayer";
import { summarize } from "@/lib/reel-summary";

export const metadata: Metadata = { title: "Reels", description: "Every course as swipeable reading reels." };

export default function ReelsPage() {
  return <ReelsPlayer collections={REELS} summaries={REELS.map(summarize)} filter="all" />;
}
