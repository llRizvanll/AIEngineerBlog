import { toneClass } from "@/config/tones";
import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Footer } from "@/components/ui";
import { Book, Title } from "@/components/HubCards";
import { MOBILE_CODING_COPY, MOBILE_CODING_META } from "@/content/pages/mobile-coding";

export const metadata: Metadata = MOBILE_CODING_META;

export default function MobileCodingPage() {
  const tags = Array.from(new Set(MOBILE_PROBLEMS.flatMap((p) => p.tags)));
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              {MOBILE_CODING_COPY.title.lead}<em>{MOBILE_CODING_COPY.title.accent}</em>
            </h1>
            <p>{MOBILE_CODING_COPY.intro}</p>
          </div>
          <Link className="btn" href={`/mobile-coding/${MOBILE_PROBLEMS[0].id}`}>
            {MOBILE_CODING_COPY.start}
          </Link>
        </div>

        <div className="mc-proof">
          {MOBILE_CODING_COPY.proof.map((t) => (
            <div key={t.label}>
              <b>{t.value ?? MOBILE_PROBLEMS.length}</b>
              <span>{t.label}</span>
            </div>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">{MOBILE_CODING_COPY.round.eyebrow}</span>
            <h2>{MOBILE_CODING_COPY.round.title}</h2>
          </div>
        </div>
        <div className="method stagger">
          {MOBILE_CODING_COPY.steps.map(([h, p], i) => (
            <div key={h} className="method-step">
              <span className="m-n">{i + 1}</span>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">{MOBILE_CODING_COPY.problems.eyebrow}</span>
            <h2>{MOBILE_CODING_COPY.problems.title}</h2>
          </div>
          <span>{tags.length} {MOBILE_CODING_COPY.problems.topics}</span>
        </div>
        <div className="cb-grid">
          {MOBILE_PROBLEMS.map((p, i) => (
            <Link key={p.id} href={`/mobile-coding/${p.id}`} className={`cb ${toneClass(i)}`}>
              <Book icon="code" label={p.tags[0]?.toUpperCase().slice(0, 11) ?? "CODE"} />
              <span className="cb-tx">
                <small>
                  {String(i + 1).padStart(2, "0")} · {p.level} · {p.minutes} min
                </small>
                <b>
                  <Title text={p.title} />
                </b>
                <span>{p.tagline}</span>
                <i>{p.file}.kt</i>
              </span>
            </Link>
          ))}
        </div>
        <ModuleShelf format="machine-coding" title={MOBILE_CODING_COPY.shelf.title} blurb={MOBILE_CODING_COPY.shelf.blurb} />
      </div>
      <Footer>{MOBILE_CODING_COPY.footer}</Footer>
    </main>
  );
}
