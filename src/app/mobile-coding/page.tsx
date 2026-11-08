import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Footer } from "@/components/ui";
import { Book, Title } from "@/components/HubCards";

export const metadata: Metadata = {
  title: "Mobile machine coding",
  description: "Low-level design and coding problems for mobile engineers, with tested Kotlin solutions and line-by-line explanations.",
};

export default function MobileCodingPage() {
  const tags = Array.from(new Set(MOBILE_PROBLEMS.flatMap((p) => p.tags)));
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              Build it <em>yourself</em>
            </h1>
            <p>Machine coding for mobile and AI engineers: caches, loaders, sync, retries and guards, with every solution explained line by line.</p>
          </div>
          <Link className="btn" href={`/mobile-coding/${MOBILE_PROBLEMS[0].id}`}>
            Start with the LRU cache
          </Link>
        </div>

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
        <div className="cb-grid">
          {MOBILE_PROBLEMS.map((p, i) => (
            <Link key={p.id} href={`/mobile-coding/${p.id}`} className={`cb pc-${i % 8}`}>
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
        <ModuleShelf format="machine-coding" title="AI machine coding" blurb="Kernels, adapters, guards, checkpoints" />
      </div>
      <Footer>AI Engineer · mobile machine coding</Footer>
    </main>
  );
}
