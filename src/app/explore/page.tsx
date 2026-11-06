import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { Footer } from "@/components/ui";
import { buildCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Explore the catalog",
  description: "Filter every lesson, problem and revision card by mode, domain, depth and time.",
};

export default function ExplorePage() {
  const total = buildCatalog().length;
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero explore-head">
          <div className="kicker">Catalog · {total} assets</div>
          <h1>
            Find what you <span className="serif grad-text">need next.</span>
          </h1>
          <p>Search everything, or pick a mode. Open Filters for domain, depth and time.</p>
        </section>
        <CatalogExplorer />
      </div>
      <Footer>AI Engineer · catalog</Footer>
    </main>
  );
}
