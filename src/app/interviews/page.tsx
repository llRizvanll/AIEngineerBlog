import type { Metadata } from "next";
import Link from "next/link";
import { CardGrid } from "@/components/HubCards";
import { siteMap } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Interview",
  description: "Prepare for AI-era interviews: AI-assisted coding rounds, system design, coding patterns and behavioral questions.",
  alternates: { canonical: "/interviews" },
};

export default function Interviews() {
  const map = siteMap();
  const items = [...map.find((g) => g.id === "interview")!.items, map.find((g) => g.id === "design")!.items[0]];
  return (
    <main className="app-page">
      <div className="ap-head">
        <div>
          <h1>
            Get ready for <em>the round</em>
          </h1>
          <p>Every round companies run now, with practice for each.</p>
        </div>
        <Link className="btn" href="/paths/ai-interviews">
          Start with AI interviews
        </Link>
      </div>
      <CardGrid items={items} tag="Open" />
    </main>
  );
}
