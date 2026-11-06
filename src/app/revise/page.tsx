import type { Metadata } from "next";
import { FLASHCARDS } from "@/content/modules";
import { Revise, type ReviseCard } from "@/components/interview/Revise";
import { Footer } from "@/components/ui";
import { CASES, CRITICAL } from "@/lib/content";
import { CASE_SHORT, critKey, SECTION_NAME } from "@/lib/routes";
import { AI_BASICS_GROUP, basicCards } from "@/lib/ai-basics-cards";

export const metadata: Metadata = { title: "Flashcards: spaced recall", description: "Due cards return on schedule: incidents, probes, traps and AI systems recall." };

const WHY: Record<string, string> = {
  Incident: "Panels use incidents to test whether you stop the damage first.",
  Probe: "Probes test the mechanism behind the term, not just the term.",
  Trap: "Traps catch answers that sound right but fail in production.",
};

export default function RevisePage() {
  const cards: ReviseCard[] = [
    ...basicCards(false),
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
  const groups = [{ id: AI_BASICS_GROUP, label: "AI interview basics" }, { id: "ai-systems", label: "AI systems" }, ...CASES.map((c) => ({ id: c.id, label: CASE_SHORT[c.id] ?? c.title }))];
  return (
    <main>
      <div className="wrap">
        <section className="rv-hero">
          <div className="kicker">Revise · {cards.length} cards</div>
          <h1>
            Recall it <span className="serif grad-text">on schedule.</span>
          </h1>
          <p>Answer out loud, flip, rate yourself. Hard cards return soon; easy ones wait longer. Progress stays in this browser.</p>
        </section>
        <Revise cards={cards} groups={groups} />
      </div>
      <Footer>AI Engineer · revise</Footer>
    </main>
  );
}
