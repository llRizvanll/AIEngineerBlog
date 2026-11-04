import Link from "next/link";
import type { CSSProperties } from "react";
import { CASES, DEEP, PROTOCOLS, REELS, SERIES, totalCritical } from "@/lib/content";
import { PATTERNS } from "@/content/coding";
import { ALL_BEHAVIORAL as BEHAVIORAL } from "@/content/behavioral";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { TodayQuestion } from "@/components/TodayQuestion";
import { KeepReading } from "@/components/KeepReading";
import { ReelCourseCard } from "@/components/ReelCourseCard";
import { HomeSearch } from "@/components/HomeSearch";
import { Icon } from "@/components/Icons";
import { PostCover } from "@/components/post/PostCover";
import { postVars } from "@/lib/postStyle";

const g = (a: string, b: string) => ({ "--g1": a, "--g2": b }) as CSSProperties;

export default function Home() {
  const learn = REELS.filter((c) => c.group === "learn");
  const reelCount = REELS.reduce((a, c) => a + c.reels.length, 0);
  const mobile = DEEP.filter((d) => d.group === "mobile");
  const ai = DEEP.filter((d) => d.group === "ai");

  const tiles = [
    { href: "/aiengine", icon: "compass", title: "AIEngine curriculum", text: "Twelve phases and four learning paths that stitch every post, round, pattern and deep dive into one route.", meta: "12 phases", big: true, c: g("#6c47ff", "#ec4899") },
    { href: "/interview", icon: "board", title: "Interview room", text: "Timed mock rounds with practice mode and a whiteboard.", meta: `${CASES.length} rounds`, c: g("#0ea5e9", "#6c47ff") },
    { href: "/deep", icon: "layers", title: "Deep dives", text: "One level below the boxes on your diagram.", meta: `${DEEP.length} pages`, c: g("#8b5cf6", "#d946ef") },
    { href: "/protocols", icon: "network", title: "Protocol Explorer", text: "DHCP to SSH, decoded byte by byte.", meta: `${PROTOCOLS.length} protocols`, c: g("#06b6d4", "#10b981") },
    { href: "/reels", icon: "play", title: "Reels", text: "The whole portal as swipeable cards.", meta: `${reelCount} reels`, c: g("#f43f5e", "#f59e0b") },
    { href: "/revise", icon: "cards", title: "Revise", text: "Incidents, probes and traps as flashcards. Shuffle, flip, and mark what you can already answer.", meta: `${totalCritical()} cards`, wide: true, c: g("#f59e0b", "#ec4899") },
    { href: "/library", icon: "book", title: "My library", text: "Saved pages and reading progress, kept in this browser.", meta: "personal", wide: true, c: g("#10b981", "#0ea5e9") },
  ];

  return (
    <main className="home">
      <div className="wrap">
        <section className="h-hero">
          <div className="h-copy">
            <Link href="/protocols" className="h-badge">
              <span>New</span> Protocol Explorer — packets decoded byte by byte <Icon name="arrow" size={14} />
            </Link>
            <h1>
              Design it like a <span className="serif grad-text">principal.</span>
            </h1>
            <p className="h-lede">
              Mock interview rounds on mobile systems and AI. Draw the architecture, walk the flow, defend the trade-offs — then go one level deeper
              into sync engines, LLM internals, RAG, agents and MCP.
            </p>
            <div className="btns">
              <Link className="btn" href="/aiengine">
                Start learning <Icon name="arrow" size={16} />
              </Link>
              <Link className="btn ghost" href="/interview">
                Enter the interview room
              </Link>
            </div>
            <HomeSearch />
          </div>
          <div className="h-side">
            <TodayQuestion cases={CASES.map(({ id, track, minutes, prompt, title }) => ({ id, track, minutes, prompt, title }))} />
            <div className="h-float f1">
              <Icon name="bolt" size={16} />
              <span>
                <b>45 min</b> timed rounds
              </span>
            </div>
            <div className="h-float f2">
              <Icon name="spark" size={16} />
              <span>
                <b>Practice mode</b> on every round
              </span>
            </div>
          </div>
        </section>

        <div className="h-stats">
          {[
            [SERIES.length, "Long reads"],
            [CASES.length, "Mock rounds"],
            [DEEP.length, "Deep dives"],
            [PROTOCOLS.length, "Protocols"],
            [totalCritical(), "Revision cards"],
          ].map(([n, l]) => (
            <div key={l}>
              <b>{n}</b>
              <span>{l}</span>
            </div>
          ))}
        </div>

        <KeepReading />

        <div className="section-h">
          <div>
            <span className="eyebrow">Explore</span>
            <h2>Everything you need for the loop</h2>
          </div>
        </div>
        <div className="bento stagger">
          {tiles.map((t) => (
            <Link key={t.href} href={t.href} className={"tile" + (t.big ? " big" : "") + (t.wide ? " wide" : "")} style={t.c}>
              <span className="tile-ic">
                <Icon name={t.icon} size={t.big ? 26 : 22} />
              </span>
              <span className="tile-meta">{t.meta}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <span className="tile-go">
                Open <Icon name="arrow" size={15} />
              </span>
            </Link>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">Beyond system design</span>
            <h2>Crack the other rounds</h2>
          </div>
        </div>
        <div className="prep-band">
          <Link href="/coding" className="prep-card" style={g("#0ea5e9", "#6c47ff")}>
            <span className="eyebrow">Coding round</span>
            <h3>{PATTERNS.length} patterns, {PATTERNS.length + Object.values(MORE_PROBLEMS).flat().length} worked problems</h3>
            <p>Signals to spot each one, a Python template, a worked problem, practice lists, and the hacks and tricks that save the round.</p>
            <div className="pc-chips">
              {PATTERNS.slice(0, 6).map((p) => (
                <span key={p.id}>{p.name}</span>
              ))}
              <span>+{PATTERNS.length - 6} more</span>
            </div>
            <span className="pc-go">
              Open coding prep <Icon name="arrow" size={15} />
            </span>
          </Link>
          <Link href="/mobile-coding" className="prep-card" style={g("#10b981", "#6c47ff")}>
            <span className="eyebrow">Mobile machine coding</span>
            <h3>{MOBILE_PROBLEMS.length} components, in tested Swift</h3>
            <p>LRU cache, image loader, offline outbox, retries, paging, uploads and list diffing, explained line by line with Android equivalents.</p>
            <div className="pc-chips">
              <span>Swift 6</span>
              <span>async/await</span>
              <span>actors</span>
              <span>42 tests</span>
            </div>
            <span className="pc-go">
              Open mobile coding <Icon name="arrow" size={15} />
            </span>
          </Link>
          <Link href="/problem-solving" className="prep-card" style={g("#f97316", "#ec4899")}>
            <span className="eyebrow">Behavioral round</span>
            <h3>{BEHAVIORAL.length} problem-solving questions, answered</h3>
            <p>STAR model answers from real engineering situations, what the panel is testing, the follow-up probe and the red flags.</p>
            <div className="pc-chips">
              <span>Root cause</span>
              <span>Decisions under pressure</span>
              <span>Conflict</span>
              <span>Crisis leadership</span>
            </div>
            <span className="pc-go">
              Open behavioral prep <Icon name="arrow" size={15} />
            </span>
          </Link>
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">The series</span>
            <h2>Mobile systems at scale</h2>
          </div>
          <Link href="/series">Read the series →</Link>
        </div>
        <div className="series-g stagger">
          {SERIES.map((s, i) => (
            <Link key={s.id} href={s.href} className={"post-card" + (i === 0 ? " lead-card" : "")} style={postVars(s.id)}>
              {i === 0 ? (
                <span className="pc-num pc-grad">{s.num}</span>
              ) : (
                <div className="pc-cover">
                  <PostCover id={s.id} num={s.num} compact />
                </div>
              )}
              <div className="pc-body">
                {i === 0 && <span className="pc-flag">Start here</span>}
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
              </div>
              <span className="pc-meta">
                <Icon name="clock" size={14} /> {s.mins} min read
              </span>
            </Link>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">Interview room</span>
            <h2>Pick a round. Start the clock.</h2>
          </div>
          <Link href="/interview">All {CASES.length} rounds →</Link>
        </div>
        <div className="hcases stagger">
          {CASES.map((c) => (
            <Link key={c.id} className="hc" href={`/interview/${c.id}`}>
              <div className="hc-top">
                <span className={"pill " + (c.track === "AI" ? "ai" : "")}>{c.track}</span>
                <span className="hc-min">{c.minutes} min</span>
              </div>
              <b>{c.title}</b>
              <span className="mono">{c.tags.slice(0, 3).map((t) => "#" + t).join("  ")}</span>
            </Link>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">Deep dives</span>
            <h2>Under the hood</h2>
          </div>
          <Link href="/deep">All deep dives →</Link>
        </div>
        <div className="dd-split">
          {[
            ["Mobile components", "Low-level design with production code", mobile],
            ["AI handbook", "Internals, retrieval, agents and integration", ai],
          ].map(([t, sub, items]) => (
            <div key={t as string} className="dd-col">
              <div className="dd-col-h">
                <h3>{t as string}</h3>
                <p>{sub as string}</p>
              </div>
              {(items as typeof DEEP).map((d, i) => (
                <Link key={d.id} href={`/deep/${d.id}`} className="dd-row">
                  <span className="dd-i">{String(i + 1).padStart(2, "0")}</span>
                  <span className="dd-t">{d.title}</span>
                  <Icon name="arrow" size={16} />
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">Reels</span>
            <h2>Learn it in two-minute swipes</h2>
          </div>
          <Link href="/reels">All {REELS.length} collections →</Link>
        </div>
        <div className="reel-strip">
          {learn.slice(0, 4).map((c, i) => (
            <ReelCourseCard key={c.id} c={c} n={i + 1} />
          ))}
        </div>

        <div className="section-h">
          <div>
            <span className="eyebrow">The format</span>
            <h2>Every post is built the same way</h2>
          </div>
        </div>
        <div className="kit stagger">
          {[
            ["target", "One rule", "The single idea the whole post hangs on, in one line."],
            ["spark", "An analogy", "A plain-language example for when an interviewer says “explain it simply”."],
            ["bolt", "Something to break", "A simulator or calculator, so you see the failure instead of reading about it."],
            ["board", "Interview kit", "30-second and 2-minute pitches, worked scenarios, rapid-fire answers and a quiz."],
          ].map(([ic, t, p]) => (
            <div key={t}>
              <span className="kit-ic">
                <Icon name={ic} size={20} />
              </span>
              <b>{t}</b>
              <p>{p}</p>
            </div>
          ))}
        </div>

        <section className="cta-band">
          <div>
            <h2>
              Ready for the <span className="serif">panel?</span>
            </h2>
            <p>Start with the curriculum, or jump straight into a timed round.</p>
          </div>
          <div className="btns">
            <Link className="btn light" href="/aiengine">
              Open AIEngine
            </Link>
            <Link className="btn outline" href="/revise">
              Revise flashcards
            </Link>
          </div>
        </section>
      </div>
      <footer>
        <div className="wrap foot">
          <span>
            <span className="logo-mark sm">AI</span> AI Engineer
          </span>
          <span>Written by Rizvan · mobile + AI systems</span>
        </div>
      </footer>
    </main>
  );
}
