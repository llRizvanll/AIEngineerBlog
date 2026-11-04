import Link from "next/link";
import type { CSSProperties } from "react";
import { siteMap } from "@/lib/sections";
import type { NavItem } from "@/lib/nav-types";
import { KeepReading } from "@/components/KeepReading";
import { Icon } from "@/components/Icons";
import { AppearanceButton, ExploreButton, HeroSearch } from "@/components/HomeActions";

const cvars = (c: [string, string]) => ({ "--c1": c[0], "--c2": c[1] }) as CSSProperties;
const num = (s?: string) => (s ? parseInt(s, 10) || 0 : 0);

const FORMATS = [
  { icon: "book", title: "Read", text: "Long-form explanations with diagrams, analogies and interactive pieces.", c: ["#f97316", "#e11d48"] as [string, string] },
  { icon: "play", title: "Watch", text: "Reels that step through ideas and code one beat at a time.", c: ["#f43f5e", "#f59e0b"] as [string, string] },
  { icon: "clock", title: "Practise", text: "Timed rounds and problems with model answers to compare against.", c: ["#0ea5e9", "#6c47ff"] as [string, string] },
  { icon: "cards", title: "Recall", text: "Flashcards and quizzes that track what you already know.", c: ["#a855f7", "#f43f5e"] as [string, string] },
];

const LOOP = [
  ["Learn", "Build the mental model first: what it is, why it exists, how it fails."],
  ["Practise", "Answer out loud or in code before revealing the model answer."],
  ["Revise", "Short reels and flashcards keep it fresh with minutes a day."],
  ["Track", "Progress, saves and notes stay on your device. No account needed."],
];

export default function Home() {
  const groups = siteMap();
  const items = groups.flatMap((g) => g.items);
  const start = groups[0].items[0];
  const totals = groups.map((g) => ({ label: g.label, n: g.items.reduce((a, it) => a + num(it.count), 0) }));

  // Two rings of section icons for the hero orbit, built from the registry.
  const inner = items.slice(0, Math.ceil(items.length / 2));
  const outer = items.slice(Math.ceil(items.length / 2));
  const ring = (list: NavItem[], radius: number, cls: string) =>
    list.map((it, i) => {
      const angle = (360 / list.length) * i - 90;
      return (
        <Link
          key={it.href}
          href={it.href}
          className={"orb " + cls}
          style={{ ...cvars(it.color), "--a": `${angle}deg`, "--r": `${radius}px` } as CSSProperties}
          title={it.title}
          aria-label={it.title}
        >
          <span className="orb-in">
            <Icon name={it.icon} size={20} />
          </span>
        </Link>
      );
    });

  return (
    <main className="landing">
      <div className="wrap">
        <section className="l-hero">
          <div className="l-copy">
            <span className="l-badge">
              <i /> Learn · Practise · Revise
            </span>
            <h1>
              Become the engineer <span className="serif grad-text">they hire.</span>
            </h1>
            <p className="l-lede">
              One calm place to understand systems deeply, rehearse every interview round, and keep it all fresh. Read, watch, practise and recall,
              at your own pace, with progress saved on your device.
            </p>
            <div className="btns">
              <Link className="btn" href={start.href}>
                Start with the {start.title.toLowerCase()} <Icon name="arrow" size={16} />
              </Link>
              <ExploreButton />
            </div>
            <HeroSearch />
          </div>
          <div className="l-visual" aria-hidden={false}>
            <div className="orbit">
              <div className="orbit-ring r1" />
              <div className="orbit-ring r2" />
              <div className="orbit-core">
                <span className="logo-mark">AI</span>
              </div>
              <div className="orbit-spin s1">{ring(inner, 120, "o1")}</div>
              <div className="orbit-spin s2">{ring(outer, 205, "o2")}</div>
            </div>
          </div>
        </section>

        <div className="l-stats">
          <div>
            <b>{items.length}</b>
            <span>sections</span>
          </div>
          {totals.map((t) => (
            <div key={t.label}>
              <b>{t.n}</b>
              <span>to {t.label.toLowerCase()}</span>
            </div>
          ))}
        </div>

        <KeepReading />

        <div className="section-h" id="explore">
          <div>
            <span className="eyebrow">Explore by goal</span>
            <h2>What do you want to do today?</h2>
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
            <span className="eyebrow">Formats</span>
            <h2>Four ways to learn the same idea</h2>
          </div>
        </div>
        <div className="formats stagger">
          {FORMATS.map((f) => (
            <div key={f.title} className="format" style={cvars(f.c)}>
              <span className="fm-ic">
                <Icon name={f.icon} size={22} />
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>A simple loop that compounds</h2>
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
            <h2>Your colours, your fonts, your pace.</h2>
            <p>Seven palettes, light, dark or sepia, and separate fonts for the interface, long reads and code. Everything is remembered on this device.</p>
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
              Ready when <span className="serif">you are.</span>
            </h2>
            <p>Pick a goal, or let the curriculum lead the way.</p>
          </div>
          <div className="btns">
            <Link className="btn light" href={start.href}>
              Start now
            </Link>
            <Link className="btn outline" href="#explore">
              Browse sections
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
