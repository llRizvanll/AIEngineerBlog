import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import { DEEP } from "@/lib/content";
import { Footer } from "@/components/ui";
import { DEEP_GROUPS } from "@/content/page-copy";
import { DEEP_COPY, DEEP_META } from "@/content/pages/deep";

export const metadata: Metadata = DEEP_META;

export default function DeepIndex() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">{DEEP_COPY.kicker}</div>
          <h1>
            {DEEP_COPY.title.lead}<span className="serif grad-text">{DEEP_COPY.title.accent}</span>
          </h1>
          <p>{DEEP_COPY.intro}</p>
        </section>
        {DEEP_GROUPS.map(([g, title, sub]) => {
          const items = DEEP.filter((d) => d.group === g);
          return (
            <div key={g}>
              <div className="section-h">
                <h2>{title}</h2>
                <span>{items.length} {DEEP_COPY.pages}</span>
              </div>
              <p className="grp-sub">{sub}</p>
              <div className="iv-grid stagger">
                {items.map((d) => (
                  <Link key={d.id} className="iv-card" href={`/deep/${d.id}`}>
                    <div className="iv-top">
                      <span className={"pill " + (d.group === "ai" ? "ai" : "")}>{d.group === "ai" ? DEEP_COPY.cardAi : DEEP_COPY.cardMobile}</span>
                      <span className="mono">{d.kicker.split("·")[1] || ""}</span>
                    </div>
                    <h3>{d.title}</h3>
                    <p>{d.summary.length > 200 ? d.summary.slice(0, 197) + "…" : d.summary}</p>
                    <span className="iv-go">{DEEP_COPY.read}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        <ModuleShelf format="deep-dive" title={DEEP_COPY.shelf.title} blurb={DEEP_COPY.shelf.blurb} />
      </div>
      <Footer>{DEEP_COPY.footer}</Footer>
    </main>
  );
}
