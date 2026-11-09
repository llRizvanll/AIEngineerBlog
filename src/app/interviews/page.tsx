import type { Metadata } from "next";
import Link from "next/link";
import { CardGrid } from "@/components/HubCards";
import { siteMap } from "@/lib/sections";
import { INTERVIEWS_COPY, INTERVIEWS_META } from "@/content/pages/interviews";

export const metadata: Metadata = INTERVIEWS_META;

export default function Interviews() {
  const map = siteMap();
  const items = [...map.find((g) => g.id === "interview")!.items, map.find((g) => g.id === "design")!.items[0]];
  return (
    <main className="app-page">
      <div className="ap-head">
        <div>
          <h1>
            {INTERVIEWS_COPY.title.lead}<em>{INTERVIEWS_COPY.title.accent}</em>
          </h1>
          <p>{INTERVIEWS_COPY.intro}</p>
        </div>
        <Link className="btn" href={INTERVIEWS_COPY.start.href}>
          {INTERVIEWS_COPY.start.label}
        </Link>
      </div>
      <CardGrid items={items} tag={INTERVIEWS_COPY.cardTag} />
    </main>
  );
}
