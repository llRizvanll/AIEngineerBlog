import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import { PROTOCOLS } from "@/lib/content";
import { hexs } from "@/components/protocols/hex";
import { DoneMark } from "@/components/protocols/ProtocolLesson";
import { PROTOCOL_LAYERS, PROTOCOL_JOURNEY } from "@/content/page-copy";
import { PROTOCOLS_PAGE_COPY } from "@/content/pages/protocols";

export const metadata: Metadata = { title: "Protocol Explorer", description: "Fourteen protocols decoded packet by packet." };

export default function ProtocolsIndex() {
  return (
    <main className="view pe pe-page" id="view-proto">
      <div className="pe-wrap">
        <section className="pe-hero">
          <div className="pe-kick">{PROTOCOLS_PAGE_COPY.kicker}</div>
          <h1>
            {PROTOCOLS_PAGE_COPY.title.lead}<em>{PROTOCOLS_PAGE_COPY.title.accent}</em>
          </h1>
<p>{PROTOCOLS_PAGE_COPY.intro}</p>
          <div className="pe-cta">
            <Link className="pe-btn" href={PROTOCOLS_PAGE_COPY.start.href}>
              {PROTOCOLS_PAGE_COPY.start.label}
            </Link>
            <Link className="pe-btn ghost" href={PROTOCOLS_PAGE_COPY.jump.href}>
              {PROTOCOLS_PAGE_COPY.jump.label}
            </Link>
          </div>
          <div className="pe-hex" aria-hidden>
            {PROTOCOLS_PAGE_COPY.hexSample.split(" ").map((h, i) => (
              <span key={i}>{h}</span>
            ))}
          </div>
        </section>
        <h2 className="pe-h">{PROTOCOLS_PAGE_COPY.journeyTitle}</h2>
        <div className="pe-journey stagger">
          {PROTOCOL_JOURNEY.map(([id, t, s], i) => (
            <Link key={id} href={`/protocols/${id}`}>
              <b>{i + 1}</b>
              <span className="n">{id.toUpperCase()}</span>
              <strong>{t}</strong>
              <small>{s}</small>
            </Link>
          ))}
        </div>
        <h2 className="pe-h">{PROTOCOLS_PAGE_COPY.layersTitle}</h2>
        <div className="pe-layers">
          {PROTOCOL_LAYERS.map(([l, d]) => (
            <div key={l}>
              <h3>
                {l}
                <small>{d}</small>
              </h3>
              <div className="chips">
                {PROTOCOLS.filter((p) => p.layer === l).map((p) => (
                  <Link key={p.id} href={`/protocols/${p.id}`}>
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <h2 className="pe-h">
          {PROTOCOLS_PAGE_COPY.allTitle} <span>{PROTOCOLS.length} {PROTOCOLS_PAGE_COPY.lessons}</span>
        </h2>
        <div className="pe-grid stagger">
          {PROTOCOLS.map((d, i) => {
            const strip: { h: string; c: number }[] = [];
            d.packets[0].fields.forEach((f, k) => hexs(f.x).slice(0, 3).forEach((h) => strip.push({ h, c: k % 8 })));
            return (
              <Link key={d.id} className="pe-card" href={`/protocols/${d.id}`}>
                <div className="top">
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`lay l-${d.layer}`}>{d.layer}</span>
                  <DoneMark id={d.id} />
                </div>
                <h3>{d.name}</h3>
                <p>{d.tag}</p>
                <div className="pe-strip" aria-hidden>
                  {strip.slice(0, 14).map((b, k) => (
                    <i key={k} className={`c${b.c}`}>
                      {b.h}
                    </i>
                  ))}
                </div>
                <small>
                  {d.port} · {d.packets.reduce((a, p) => a + p.fields.length, 0)} {PROTOCOLS_PAGE_COPY.fieldsDecoded}
                </small>
              </Link>
            );
          })}
        </div>
        <ModuleShelf format="protocol" title={PROTOCOLS_PAGE_COPY.shelf.title} blurb={PROTOCOLS_PAGE_COPY.shelf.blurb} />
      </div>
      <footer className="pe-foot">{PROTOCOLS_PAGE_COPY.footer}</footer>
    </main>
  );
}
