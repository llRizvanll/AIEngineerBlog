import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Footer } from "@/components/ui";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Mobile machine coding",
  description: "Low-level design and coding problems for mobile engineers, with tested Kotlin solutions and line-by-line explanations.",
};

export default function MobileCodingPage() {
  const tags = Array.from(new Set(MOBILE_PROBLEMS.flatMap((p) => p.tags)));
  return (
    <main className="prep-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">
            <Link href="/coding">Coding round</Link> · Mobile machine coding · {MOBILE_PROBLEMS.length} problems
          </div>
          <h1>
            Build the components <span className="serif grad-text">apps run on.</span>
          </h1>
          <p>
            The low-level design round for mobile engineers: caches, image loaders, offline sync, retries, pagination and uploads. Each solution is
            production-style Kotlin with coroutines, Flow and structured concurrency, compiled with warnings as errors and covered by tests, then
            explained line by line with the iOS equivalent.
          </p>
          <div className="btns">
            <Link className="btn" href="/reels/c-mobile">
              <Icon name="play" size={16} /> Watch as reels
            </Link>
            <Link className="btn ghost" href={`/mobile-coding/${MOBILE_PROBLEMS[0].id}`}>
              Start with the LRU cache
            </Link>
          </div>
        </section>

        <div className="mc-proof">
          <div>
            <b>{MOBILE_PROBLEMS.length}</b>
            <span>problems</span>
          </div>
          <div>
            <b>Kotlin 2</b>
            <span>coroutines and Flow</span>
          </div>
          <div>
            <b>68</b>
            <span>passing tests</span>
          </div>
          <div>
            <b>iOS</b>
            <span>equivalents for each</span>
          </div>
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">How the round works</span>
            <h2>45 minutes, one component</h2>
          </div>
        </div>
        <div className="method stagger">
          {[
            ["Clarify", "Scope, scale, threading model, what is out of scope."],
            ["API first", "Write the public interface and the state it owns."],
            ["Core logic", "The happy path, then the concurrency story."],
            ["Edge cases", "Failure, cancellation, kills, duplicates."],
            ["Test it", "Show how you would test it with fakes."],
            ["Extend", "Priorities, persistence, metrics: talk trade-offs."],
          ].map(([h, p], i) => (
            <div key={h} className="method-step">
              <span className="m-n">{i + 1}</span>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">Problems</span>
            <h2>Pick a component</h2>
          </div>
          <span>{tags.length} topics</span>
        </div>
        <div className="mc-grid stagger">
          {MOBILE_PROBLEMS.map((p, i) => (
            <Link key={p.id} href={`/mobile-coding/${p.id}`} className="pattern-card mc-card" style={{ "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties}>
              <div className="mc-top">
                <span className="pc-idx">{String(i + 1).padStart(2, "0")}</span>
                <span className={"pr-lv lv-" + p.level.toLowerCase()}>{p.level}</span>
                <span className="mc-min">{p.minutes} min</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.tagline}</p>
              <div className="pc-sig">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <span className="pc-foot">
                {p.file}.kt <Icon name="arrow" size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer>AI Engineer · mobile machine coding</Footer>
    </main>
  );
}
