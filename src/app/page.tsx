import Link from "next/link";
import type { CSSProperties } from "react";
import { siteMap } from "@/lib/sections";
import { buildCatalog } from "@/lib/catalog";
import { curriculumCounts, systemMap } from "@/lib/system-map";
import { CURRICULUM } from "@/types/portal";
import { KeepReading } from "@/components/KeepReading";
import { Icon } from "@/components/Icons";
import { SystemMap } from "@/components/SystemMap";
import { AppearanceButton, HeroSearch } from "@/components/HomeActions";

const cvars = (c: [string, string]) => ({ "--c1": c[0], "--c2": c[1] }) as CSSProperties;

const LOOP = [
  ["Learn", "Start from the whole system, then drill into one part."],
  ["Practise", "Answer out loud or in code before you open the model answer."],
  ["Revise", "Due cards and short reels return on schedule, minutes a day."],
  ["Track", "Progress, saves and notes stay on your device. No account."],
];

export default function Home() {
  const groups = siteMap();
  const items = groups.flatMap((g) => g.items);
  const catalog = buildCatalog();
  const count = (mode: string) => catalog.filter((a) => a.mode === mode).length;
  const topic = curriculumCounts();

  return (
    <main className="landing">
      <div className="wrap">
        <section className="l-hero">
          <div className="l-copy">
            <span className="l-badge">
              <i /> Learn · Practise · Revise
            </span>
            <h1>
              See the whole system. <span className="serif grad-text">Master each part.</span>
            </h1>
            <p className="l-lede">
              Trace one AI request from phone to GPU, then drill into any layer. Long reads and deep dives build the model, coding and design rounds
              test it, and spaced flashcards keep it.
            </p>
            <div className="btns">
              <Link className="btn" href="/aiengine">
                Start the curriculum <Icon name="arrow" size={16} />
              </Link>
              <Link className="btn ghost" href="/explore">
                <Icon name="grid" size={16} /> Browse the catalog
              </Link>
            </div>
            <HeroSearch />
          </div>
          <div className="l-visual">
            <SystemMap layers={systemMap()} />
          </div>
        </section>

        <div className="l-stats">
          <Link href="/explore?mode=learn">
            <b>{count("learn")}</b>
            <span>Learn modules</span>
          </Link>
          <Link href="/explore?mode=practice">
            <b>{count("practice")}</b>
            <span>Practice problems</span>
          </Link>
          <Link href="/explore?mode=revise">
            <b>{count("revise")}</b>
            <span>Revise cards and reels</span>
          </Link>
          <Link href="/modules">
            <b>{CURRICULUM.length}</b>
            <span>Curriculum domains</span>
          </Link>
        </div>

        <KeepReading />

        <div className="section-h" id="explore">
          <div>
            <span className="eyebrow">Three modes</span>
            <h2>Learn it. Prove it. Keep it.</h2>
          </div>
        </div>
        <div className="goals">
          {groups.map((g, gi) => (
            <section key={g.id} className={"goal g" + gi}>
              <header>
                <span className="goal-n">{String(gi + 1).padStart(2, "0")}</span>
                <h3>{g.label}</h3>
                <p>{g.blurb}</p>
              </header>
              <div className="goal-items">
                {g.items.map((it) => (
                  <Link key={it.href} href={it.href} className="goal-item" style={cvars(it.color)}>
                    <span className="gi-ic">
                      <Icon name={it.icon} size={18} />
                    </span>
                    <span className="gi-tx">
                      {it.level && <i className="gi-level">{it.level}</i>}
                      <b>{it.title}</b>
                      <span>{it.desc}</span>
                    </span>
                    {it.count && <small>{it.count}</small>}
                    <Icon name="arrow" size={15} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">Curriculum</span>
            <h2>Eleven domains, one map</h2>
          </div>
        </div>
        <div className="domain-grid">
          {CURRICULUM.map((c) => {
            const k = topic(c.n);
            return (
              <Link key={c.n} href={`/explore?topic=${c.n}`} className="domain-card">
                <span className="dc-n">{String(c.n).padStart(2, "0")}</span>
                <b>{c.title}</b>
                <span className="dc-terms">{c.terms}</span>
                <span className="dc-counts">
                  <i className="am-learn">{k.learn} learn</i>
                  <i className="am-practice">{k.practice} practice</i>
                  <i className="am-revise">{k.revise} revise</i>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>Four steps, repeated</h2>
          </div>
        </div>
        <ol className="loop">
          {LOOP.map(([h, p], i) => (
            <li key={h}>
              <span className="lp-n">{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ol>

        <section className="l-yours">
          <div>
            <span className="eyebrow">Make it yours</span>
            <h2>Your colours, fonts and pace.</h2>
            <p>Pick from seven palettes, three themes, and separate fonts for interface, reading and code. This device remembers them.</p>
            <AppearanceButton />
          </div>
          <div className="yours-swatches" aria-hidden>
            {["#6c47ff,#ec4899", "#2563eb,#06b6d4", "#ea580c,#e11d48", "#047857,#65a30d", "#9333ea,#db2777", "#ca8a04,#f97316", "#334155,#64748b"].map((c, i) => {
              const [a, b] = c.split(",");
              return <span key={c} style={{ "--a": a, "--b": b, "--i": i } as CSSProperties} />;
            })}
          </div>
        </section>

        <section className="cta-band">
          <div>
            <h2>
              Start with <span className="serif">one layer.</span>
            </h2>
            <p>Follow the curriculum, or filter the catalog by what you need today.</p>
          </div>
          <div className="btns">
            <Link className="btn light" href="/aiengine">
              Start the curriculum
            </Link>
            <Link className="btn outline" href="/explore">
              Browse the catalog
            </Link>
          </div>
        </section>
      </div>
      <footer>
        <div className="wrap foot">
          <span>
            <span className="logo-mark sm">AI</span> AI Engineer
          </span>
          <nav className="foot-links" aria-label="Footer">
            {items.map((it) => (
              <Link key={it.href} href={it.href}>
                {it.title}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}
