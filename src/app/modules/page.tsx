import Link from "next/link";
import type { Metadata } from "next";
import { MODULES } from "@/content/modules";
import { ModuleCard } from "@/components/ModuleShelf";
import { Footer } from "@/components/ui";
import { CURRICULUM } from "@/types/portal";

export const metadata: Metadata = {
  title: "AI systems modules",
  description: "Serving, retrieval, fine-tuning, evals, safety and GPU infrastructure, one tested module at a time.",
};

export default function ModulesPage() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">AI systems · {MODULES.length} modules</div>
          <h1>
            AI systems, <span className="serif grad-text">part by part.</span>
          </h1>
          <p>
            Each module opens with the whole idea, states the question, walks the mechanism, then tests you. Use{" "}
            <Link href="/explore?mode=practice">Explore</Link> to filter by mode, tier or time.
          </p>
        </section>
        <section className="mod-shelf">
          <div className="section-h">
            <h2>Mobile systems</h2>
            <span>Startup, observability, security, location, push, experiments</span>
          </div>
          <div className="mod-grid">
            {MODULES.filter((m) => !m.curriculum).map((m) => (
              <ModuleCard key={m.assetId} m={m} />
            ))}
          </div>
        </section>
        {CURRICULUM.map((c) => {
          const list = MODULES.filter((m) => m.curriculum === c.n);
          if (!list.length) return null;
          return (
            <section key={c.n} className="mod-shelf">
              <div className="section-h">
                <h2>{c.title}</h2>
                <span>{c.terms}</span>
              </div>
              <div className="mod-grid">
                {list.map((m) => (
                  <ModuleCard key={m.assetId} m={m} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <Footer>AI Engineer · AI systems modules</Footer>
    </main>
  );
}
