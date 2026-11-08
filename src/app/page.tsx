import Link from "next/link";
import { siteMap, siteStats } from "@/lib/sections";
import { KeepReading } from "@/components/KeepReading";
import { Icon } from "@/components/Icons";
import { Title } from "@/components/HubCards";
import { ArtAIBig, ArtBuild, ArtInterview, ArtMobileBig, ArtPractice, HeroLeft, HeroRight } from "@/components/HeroArt";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

const FAQ: [string, string][] = [
  ["Is it free?", "Yes. Every lesson, problem, flashcard and code sample is free to read. There is no account and no paywall."],
  ["Where do I start?", "If you are new to AI, start with the AI curriculum. If you build apps, start with React Native in one place. If you have an interview coming, start with the AI interview paths."],
  ["Does it cover coding interviews with an AI assistant?", "Yes. There are four paths: the hacks people share online, the rounds companies run now, how to use AI well in a round, and a path you build yourself. Each ends with practice."],
  ["Is the code tested?", "The code samples are compiled and run, including the buggy versions, and each one has notes that explain it line by line."],
  ["Can I study a page with Claude, ChatGPT or Gemini?", "Every lesson has Study with AI buttons. They copy the page as Markdown, or open the tool with the page ready to paste."],
  ["Where is my progress saved?", "In your own browser. Nothing is sent to a server, so clearing site data resets it."],
];

const MORE: [string, string, string, string, string, React.ReactNode][] = [
  ["Daily practice", "A few questions a day, so what you read stays with you.", "/practice", "Start practising", "pc-5", <ArtPractice key="p" />],
  ["Build it yourself", "Tested components you build and run on your own machine.", "/mobile-coding", "See the projects", "pc-6", <ArtBuild key="b" />],
  ["Interview prep", "Know every round, in order, before you walk in.", "/interviews", "Pick your round", "pc-4", <ArtInterview key="i" />],
];

export default function Home() {
  const groups = siteMap();
  const stats = siteStats();

  return (
    <main className="landing io">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: absoluteUrl("/"), description: SITE.description, inLanguage: "en", publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />

      <section className="io-hero">
        <div className="io-art-l" aria-hidden>
          <HeroLeft />
        </div>
        <div className="io-art-r" aria-hidden>
          <HeroRight />
        </div>
        <div className="io-hero-in">
          <h1>
            Know
            <br />
            inside out.
          </h1>
          <p className="io-lede">For engineers who want to know how AI and mobile systems work underneath.</p>
          <div className="btns">
            <Link className="btn" href="/learn">
              Your dashboard
            </Link>
            <a className="io-link" href="#inside">
              See a lesson
            </a>
          </div>
        </div>
      </section>

      <KeepReading />

      <section className="io-sec" aria-labelledby="start">
        <Reveal>
          <h2 id="start">
            Choose where to <em>start.</em>
          </h2>
          <p className="io-sub">Two subjects, and what is inside each.</p>
        </Reveal>
        <div className="io-start">
          {[
            { id: "ai", tone: "pc-1", name: "AI engineering", blurb: "Learn how models work, then build on them.", href: "/aiengine", art: <ArtAIBig /> },
            { id: "mobile", tone: "pc-3", name: "Mobile engineering", blurb: "Learn the systems behind fast, reliable apps.", href: "/paths/react-native", art: <ArtMobileBig /> },
          ].map((c, i) => (
            <Reveal key={c.id} delay={i * 90}>
              <article className={`io-big ${c.tone}`}>
                <div className="io-art" aria-hidden>
                  {c.art}
                </div>
                <div className="io-big-foot">
                  <div>
                    <h3>
                      <Title text={c.name} />
                    </h3>
                    <p>{c.blurb}</p>
                  </div>
                  <Link className="btn" href={c.href}>
                    Start with lesson 1 <Icon name="arrow" size={16} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="io-sec" aria-labelledby="inside">
        <Reveal>
          <h2 id="inside">See a lesson from the inside.</h2>
          <p className="io-sub">Why an edit can vanish when the app is killed, one step at a time.</p>
        </Reveal>
        <Reveal>
          <div className="io-lesson">
            <div className="io-lesson-top">
              <span>Offline sync</span>
              <span>Example 1.1</span>
            </div>
            <h3>The edit that disappeared</h3>
            <p className="io-lesson-q">A user types a note offline, then the OS kills the app. Where was the note, and what survives?</p>
            <ol>
              <li>
                <i>1</i>
                <div>
                  <b>Write to memory only</b>
                  <code>store.notes.push(note)</code>
                  <span>Fast, and gone the moment the process dies.</span>
                </div>
              </li>
              <li>
                <i>2</i>
                <div>
                  <b>The OS ends the app</b>
                  <code>SIGKILL</code>
                  <span>There is no warning and no cleanup callback to rely on.</span>
                </div>
              </li>
              <li>
                <i>3</i>
                <div>
                  <b>Write to a queue on disk first</b>
                  <code>INSERT INTO queue (id, payload)</code>
                  <span>The row is still there on the next launch, ready to send.</span>
                </div>
              </li>
            </ol>
            <div className="io-answer">
              <b>Answer</b> Persist the mutation before showing success. Memory is for speed, the queue is for truth.
            </div>
            <Link className="io-go" href="/series/background-sync">
              Read the whole lesson <Icon name="arrow" size={15} />
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="io-sec" aria-labelledby="more">
        <Reveal>
          <h2 id="more">
            More than <em>lessons.</em>
          </h2>
          <p className="io-sub">Put what you read to work.</p>
        </Reveal>
        <div className="io-more">
          {MORE.map(([t, d, href, cta, tone, art], i) => (
            <Reveal key={t} delay={i * 80}>
              <article className="io-card">
                <div className={`io-card-art ${tone}`} aria-hidden>
                  {art}
                </div>
                <div className="io-card-body">
                  <h3>
                    <Title text={t} />
                  </h3>
                  <p>{d}</p>
                  <Link className="btn" href={href}>
                    {cta} <Icon name="arrow" size={16} />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="io-sec io-faq" aria-labelledby="faq">
        <Reveal>
          <h2 id="faq">Questions, answered.</h2>
        </Reveal>
        <Reveal>
          <div className="io-faq-list">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <footer className="io-foot">
        <div className="io-foot-top">
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
      </footer>
    </main>
  );
}
