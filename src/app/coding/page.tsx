import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { COMPLEXITY, HACKS, METHOD, PATTERNS, SIGNAL_MAP } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Footer } from "@/components/ui";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Coding patterns, hacks and tricks",
  description: "Fifteen coding interview patterns with templates, worked problems, practice lists and the tricks that save minutes.",
};

const cv = (c: [string, string]) => ({ "--c1": c[0], "--c2": c[1] }) as CSSProperties;

export default function CodingPage() {
  return (
    <main className="prep-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">
            Coding round · {PATTERNS.length} patterns · {PATTERNS.length + Object.values(MORE_PROBLEMS).flat().length} worked problems · {MOBILE_PROBLEMS.length} mobile components
          </div>
          <h1>
            Crack the coding round with <span className="serif grad-text">patterns.</span>
          </h1>
          <p>
            Most interview problems are one of fifteen patterns in disguise. Learn the signals, keep a template in your head, and spend the
            interview on the twist instead of the basics.
          </p>
          <div className="btns">
            <Link className="btn" href="/reels/c-patterns">
              <Icon name="play" size={16} /> Patterns as reels
            </Link>
            <Link className="btn ghost" href="/mobile-coding">
              Mobile machine coding
            </Link>
            <Link className="btn ghost" href="/reels/q-coding-hacks">
              Hacks and tricks reels
            </Link>
          </div>
        </section>

        <div className="section-h">
          <div>
            <span className="eyebrow">The method</span>
            <h2>Six steps, every round</h2>
          </div>
          <span>about 30 minutes</span>
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
            <span className="eyebrow">Patterns</span>
            <h2>Learn the fifteen</h2>
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

        <Link href="/mobile-coding" className="prep-card mc-band" style={{ "--c1": "#0ea5e9", "--c2": "#ec4899" } as CSSProperties}>
          <span className="eyebrow">Mobile machine coding · Swift 6 · tested</span>
          <h3>Build the components apps run on</h3>
          <p>
            {MOBILE_PROBLEMS.length} low-level design problems with production-style Swift, a line-by-line walkthrough, edge cases, follow-ups and the
            Android equivalent.
          </p>
          <div className="pc-chips">
            {MOBILE_PROBLEMS.map((m) => (
              <span key={m.id}>{m.title.split(" with ")[0]}</span>
            ))}
          </div>
          <span className="pc-go">
            Open mobile machine coding <Icon name="arrow" size={15} />
          </span>
        </Link>

        <div className="cheat-row">
          <div className="cheat">
            <span className="eyebrow">Hear this → reach for that</span>
            <h3>Signal to pattern</h3>
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
            <span className="eyebrow">Read the constraints first</span>
            <h3>Input size → target complexity</h3>
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
            <span className="eyebrow">Hacks and tricks</span>
            <h2>The small things that save the round</h2>
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
      </div>
      <Footer>AI Engineer · coding round</Footer>
    </main>
  );
}
