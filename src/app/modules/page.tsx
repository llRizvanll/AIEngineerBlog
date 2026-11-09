import Link from "next/link";
import type { Metadata } from "next";
import { MODULES } from "@/content/modules";
import { ModuleCard } from "@/components/ModuleShelf";
import { Footer } from "@/components/ui";
import { CURRICULUM } from "@/types/portal";
import { MODULES_COPY, MODULES_META } from "@/content/pages/modules";

export const metadata: Metadata = MODULES_META;

export default function ModulesPage() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">{MODULES_COPY.kicker} · {MODULES.length} modules</div>
          <h1>
            {MODULES_COPY.title.lead}<span className="serif grad-text">{MODULES_COPY.title.accent}</span>
          </h1>
          <p>
            {MODULES_COPY.intro}
            <Link href={MODULES_COPY.introLink.href}>{MODULES_COPY.introLink.label}</Link>
            {MODULES_COPY.introTail}
          </p>
        </section>
        <section className="mod-shelf">
          <div className="section-h">
            <h2>{MODULES_COPY.mobileShelf.title}</h2>
            <span>{MODULES_COPY.mobileShelf.blurb}</span>
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
      <Footer>{MODULES_COPY.footer}</Footer>
    </main>
  );
}
