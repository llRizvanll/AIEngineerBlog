import Link from "next/link";
import type { CSSProperties } from "react";
import { siteMap, siteStats } from "@/lib/sections";
import { KeepReading } from "@/components/KeepReading";
import { Icon } from "@/components/Icons";
import { HeroSearch } from "@/components/HomeActions";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

const cvars = (c: [string, string]) => ({ "--c1": c[0], "--c2": c[1] }) as CSSProperties;

const WHY: [string, string][] = [
  ["Basics first", "Every lesson starts from plain words, then adds detail, so you can follow it without other tabs open."],
  ["Code that has been run", "The code samples are compiled and tested, including the buggy versions, so what you read is what works."],
  ["Sources named", "Where a claim comes from a company, a vendor or a single blog post, the page says so. Unverified numbers are labelled."],
  ["No account needed", "Your progress, notes and saves stay in your own browser, so you can start reading straight away."],
];

export default function Home() {
  const groups = siteMap();
  const stats = siteStats();

  return (
    <main className="landing lp">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: absoluteUrl("/"), description: SITE.description, inLanguage: "en", publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") } }} />
      <div className="wrap">
        <section className="lp-hero">
          <p className="lp-eyebrow">Free to read. No sign-up.</p>
          <h1>
            Learn AI and mobile engineering. <span className="serif grad-text">Then pass the interview.</span>
          </h1>
          <p className="lp-lede">
            Clear lessons that start from the basics, code that has been run, and practice for the rounds companies use now, including coding with an AI assistant.
          </p>
          <div className="btns">
            <Link className="btn" href="/aiengine">
              Learn AI engineering <Icon name="arrow" size={16} />
            </Link>
            <Link className="btn ghost" href="/paths/ai-interviews">
              Prepare for interviews
            </Link>
          </div>
          <HeroSearch />
          <p className="lp-facts">
            {stats.pages} lessons, problems and cards · {stats.code} explained code samples · {stats.cards} flashcards
          </p>
        </section>

        <KeepReading />

        <section aria-labelledby="skills">
          <h2 id="skills" className="lp-h">
            Choose a skill
          </h2>
          <div className="lp-skills">
            {groups.map((g) => (
              <article key={g.id} className="lp-skill" style={cvars(g.items[0].color)}>
                <h3>{g.label}</h3>
                <p>{g.blurb}</p>
                <ul>
                  {g.items.map((it) => (
                    <li key={it.href}>
                      <Link href={it.href}>
                        <span>{it.title}</span>
                        {it.count && <small>{it.count}</small>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="why">
          <h2 id="why" className="lp-h">
            How this site works
          </h2>
          <div className="lp-why">
            {WHY.map(([h, p]) => (
              <div key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="lp-foot">
        <div className="wrap">
          <div className="lp-foot-top">
            <div>
              <span className="lp-brand">
                <span className="logo-mark sm">AI</span> {SITE.name}
              </span>
              <p>
                {SITE.tagline}. Written by {SITE.author}.
              </p>
            </div>
            <nav aria-label="Footer" className="lp-foot-cols">
              {groups.map((g) => (
                <div key={g.id}>
                  <h4>{g.label}</h4>
                  {g.items.map((it) => (
                    <Link key={it.href} href={it.href}>
                      {it.title}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
          <p className="lp-foot-end">
            Your progress and notes stay in this browser. <Link href="/explore">Browse every page</Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
