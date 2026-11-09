import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { Footer } from "@/components/ui";
import { buildCatalog } from "@/lib/catalog";
import { EXPLORE_COPY, EXPLORE_META } from "@/content/pages/explore";

export const metadata: Metadata = EXPLORE_META;

export default function ExplorePage() {
  const total = buildCatalog().length;
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero explore-head">
          <div className="kicker">{EXPLORE_COPY.kicker} · {total} assets</div>
          <h1>
            {EXPLORE_COPY.title.lead}<span className="serif grad-text">{EXPLORE_COPY.title.accent}</span>
          </h1>
          <p>{EXPLORE_COPY.intro}</p>
        </section>
        <CatalogExplorer />
      </div>
      <Footer>{EXPLORE_COPY.footer}</Footer>
    </main>
  );
}
