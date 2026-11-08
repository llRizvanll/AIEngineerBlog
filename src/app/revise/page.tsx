import type { Metadata } from "next";
import { FLASHCARDS } from "@/content/modules";
import { Revise, type ReviseCard } from "@/components/interview/Revise";
import Link from "next/link";
import { Footer } from "@/components/ui";
import { Book, Title } from "@/components/HubCards";
import { CASES, CRITICAL } from "@/lib/content";
import { CASE_SHORT, critKey, SECTION_NAME } from "@/lib/routes";
import { AI_BASICS_GROUP, basicCards } from "@/lib/ai-basics-cards";
import { RN_GROUP, rnCards } from "@/lib/rn-cards";

export const metadata: Metadata = { title: "Flashcards: spaced recall", description: "Due cards return on schedule: incidents, probes, traps and AI systems recall." };

const WHY: Record<string, string> = {
  Incident: "Panels use incidents to test whether you stop the damage first.",
  Probe: "Probes test the mechanism behind the term, not just the term.",
  Trap: "Traps catch answers that sound right but fail in production.",
};

export default function RevisePage() {
  const cards: ReviseCard[] = [
    ...basicCards(false),
    ...rnCards(),
    ...FLASHCARDS.map((f) => ({ key: f.assetId, link: f.assetId, group: "ai-systems", groupLabel: "AI systems", kind: "Recall", q: f.front, a: f.back, why: f.commentary, source: f.source })),
    ...CASES.flatMap((c) =>
      (CRITICAL[c.id] ?? []).map((q, i) => ({
        key: critKey(c.id, q[0], i),
        link: `${c.id}:${i}`,
        group: c.id,
        groupLabel: CASE_SHORT[c.id] ?? c.title,
        kind: q[1],
        q: q[2],
        a: q[3],
        why: WHY[q[1]] ?? "",
        source: `${c.title} · ${SECTION_NAME[q[0]] ?? q[0]}`,
      }))
    ),
  ];
  const groups = [{ id: AI_BASICS_GROUP, label: "AI interview basics" }, { id: RN_GROUP, label: "React Native at scale" }, { id: "ai-systems", label: "AI systems" }, ...CASES.map((c) => ({ id: c.id, label: CASE_SHORT[c.id] ?? c.title }))];
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              Practice that <em>sticks</em>
            </h1>
            <p>
              {cards.length} cards that come back on schedule, aimed at what you miss.
            </p>
          </div>
        </div>

        <section className="ap-card today" aria-labelledby="today">
          <div>
            <h2 id="today">
              Today&apos;s <em>set</em>
            </h2>
            <p>Answer out loud, flip, rate yourself. Hard cards return soon; easy ones wait longer.</p>
            <div className="tk-act">
              <a className="btn" href="#deck">
                Start today&apos;s set
              </a>
              <Link className="tk-link" href="/practice">
                Try the practice problems
              </Link>
            </div>
          </div>
          <div className="week" aria-hidden>
            <div className="week-card">
              <small>This week</small>
              <div className="week-dots">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i}>
                    <i className={i === 0 ? "on" : undefined} />
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <b>
              A fresh <em>week</em>
            </b>
            <span>A few minutes a day is what makes it stick.</span>
          </div>
        </section>

        <section id="deck" className="ap-card">
          <Revise cards={cards} groups={groups} />
        </section>

        <h2 className="ap-h">More ways to practise</h2>
        <div className="cb-grid">
          {[
            { href: "/paths/ai-interviews/basics", icon: "bolt", t: "Critical basics", d: "Read, memorise and practise the AI interview essentials." },
            { href: "/reels", icon: "play", t: "Reels", d: "One idea at a time, built for a phone and a spare minute." },
            { href: "/library", icon: "bookmark", t: "My progress", d: "Saved pages, your notes and exports." },
          ].map((c, i) => (
            <Link key={c.href} href={c.href} className={`cb pc-${[5, 6, 4][i]}`}>
              <Book icon={c.icon} label={c.t.split(" ")[0].toUpperCase().slice(0, 11)} />
              <span className="cb-tx">
                <small>Practice</small>
                <b>
                  <Title text={c.t} />
                </b>
                <span>{c.d}</span>
                <i>Open</i>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer>AI Engineer · revise</Footer>
    </main>
  );
}
