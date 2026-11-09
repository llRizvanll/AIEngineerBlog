import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { COMPLEXITY, HACKS, METHOD, PATTERNS, SIGNAL_MAP } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Footer } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { CODING_COPY, CODING_META } from "@/content/pages/coding";

export const metadata: Metadata = CODING_META;

const cv = (c: [string, string]) => ({ "--c1": c[0], "--c2": c[1] }) as CSSProperties;

export default function CodingPage() {
  return (
    <main className="prep-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">
            {CODING_COPY.kicker} · {PATTERNS.length} patterns · {PATTERNS.length + Object.values(MORE_PROBLEMS).flat().length} worked problems · {MOBILE_PROBLEMS.length} mobile components
          </div>
          <h1>
            {CODING_COPY.title.lead}<span className="serif grad-text">{CODING_COPY.title.accent}</span>
          </h1>
<p>{CODING_COPY.intro}</p>
          <div className="btns">
            <Link className="btn" href={CODING_COPY.actions.reels.href}>
              <Icon name="play" size={16} /> {CODING_COPY.actions.reels.label}
            </Link>
            <Link className="btn ghost" href={CODING_COPY.actions.mobile.href}>
              {CODING_COPY.actions.mobile.label}
            </Link>
            <Link className="btn ghost" href={CODING_COPY.actions.hacks.href}>
              {CODING_COPY.actions.hacks.label}
            </Link>
          </div>
        </section>

        <div className="section-h">
          <div>
            <span className="eyebrow">{CODING_COPY.method.eyebrow}</span>
            <h2>{CODING_COPY.method.title}</h2>
          </div>
          <span>{CODING_COPY.method.time}</span>
        </div>
        <div className="method stagger">
          {METHOD.map(([h, p, t], i) => (
            <div key={h} className="method-step">
              <span className="m-n">{i + 1}</span>
              <h4>{h}</h4>
              <p>{p}</p>
              <span className="m-t">{t}</span>
            </div>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">{CODING_COPY.patterns.eyebrow}</span>
            <h2>{CODING_COPY.patterns.title}</h2>
          </div>
        </div>
        <div className="pattern-grid stagger">
          {PATTERNS.map((p, i) => (
            <Link key={p.id} href={`/coding/${p.id}`} className="pattern-card" style={cv(p.color)}>
              <span className="pc-idx">{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.name}</h3>
              <p>{p.tagline}</p>
              <div className="pc-sig">
                {p.signals.slice(0, 2).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <span className="pc-foot">
                {1 + (MORE_PROBLEMS[p.id]?.length ?? 0)} worked problems <Icon name="arrow" size={14} />
              </span>
            </Link>
          ))}
        </div>

        <Link href="/mobile-coding" className="prep-card mc-band" style={{ "--c1": "#0ea5e9", "--c2": "#c2410c" } as CSSProperties}>
          <span className="eyebrow">{CODING_COPY.mobileBand.eyebrow}</span>
          <h3>{CODING_COPY.mobileBand.title}</h3>
          <p>
            {MOBILE_PROBLEMS.length}
            {CODING_COPY.mobileBand.textTail}
          </p>
          <div className="pc-chips">
            {MOBILE_PROBLEMS.map((m) => (
              <span key={m.id}>{m.title.split(" with ")[0]}</span>
            ))}
          </div>
          <span className="pc-go">
            {CODING_COPY.mobileBand.go} <Icon name="arrow" size={15} />
          </span>
        </Link>

        <div className="cheat-row">
          <div className="cheat">
            <span className="eyebrow">{CODING_COPY.signals.eyebrow}</span>
            <h3>{CODING_COPY.signals.title}</h3>
            <div className="sig-list">
              {SIGNAL_MAP.map(([s, p, id]) => (
                <Link key={id} href={`/coding/${id}`} style={cv(PATTERNS.find((x) => x.id === id)!.color)}>
                  <span>{s}</span>
                  <b>{p}</b>
                </Link>
              ))}
            </div>
          </div>
          <div className="cheat">
            <span className="eyebrow">{CODING_COPY.complexity.eyebrow}</span>
            <h3>{CODING_COPY.complexity.title}</h3>
            <div className="cx-list">
              {COMPLEXITY.map(([n, o, ex], i) => (
                <div key={n} style={{ ["--w" as string]: `${100 - i * 14}%` }}>
                  <span className="cx-n">{n}</span>
                  <b>{o}</b>
                  <small>{ex}</small>
                  <i />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="section-h" id="hacks">
          <div>
            <span className="eyebrow">{CODING_COPY.hacks.eyebrow}</span>
            <h2>{CODING_COPY.hacks.title}</h2>
          </div>
        </div>
        <div className="hack-grid">
          {HACKS.map((h) => (
            <div key={h.title} className="hack" style={cv(h.color)}>
              <h3>{h.title}</h3>
              <ul>
                {h.items.map(([k, v]) => (
                  <li key={k}>
                    <code>{k}</code>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <ModuleShelf format="coding-pattern" title={CODING_COPY.shelf.title} blurb={CODING_COPY.shelf.blurb} />
      </div>
      <Footer>{CODING_COPY.footer}</Footer>
    </main>
  );
}
