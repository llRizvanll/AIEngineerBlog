import type { Metadata } from "next";
import { FLASHCARDS } from "@/content/modules";
import { Revise } from "@/components/interview/Revise";
import type { ReviseCard } from "@/types/revise";
import Link from "next/link";
import { Footer } from "@/components/ui";
import { Book, Title } from "@/components/HubCards";
import { CASES, CRITICAL } from "@/lib/content";
import { critKey } from "@/lib/routes";
import { AI_BASICS_GROUP, basicCards } from "@/lib/ai-basics-cards";
import { RN_GROUP, rnCards } from "@/lib/rn-cards";
import { REVISE_WHY } from "@/content/page-copy";
import { CASE_SHORT, SECTION_NAME } from "@/content/ui-copy";
import { REVISE_PAGE_COPY, REVISE_PAGE_META } from "@/content/pages/revise";

export const metadata: Metadata = REVISE_PAGE_META;

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
        why: REVISE_WHY[q[1]] ?? "",
        source: `${c.title} · ${SECTION_NAME[q[0]] ?? q[0]}`,
      }))
    ),
  ];
  const groups = [{ id: AI_BASICS_GROUP, label: REVISE_PAGE_COPY.groups.basics }, { id: RN_GROUP, label: REVISE_PAGE_COPY.groups.rn }, { id: "ai-systems", label: REVISE_PAGE_COPY.groups.ai }, ...CASES.map((c) => ({ id: c.id, label: CASE_SHORT[c.id] ?? c.title }))];
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              {REVISE_PAGE_COPY.title.lead}<em>{REVISE_PAGE_COPY.title.accent}</em>
            </h1>
            <p>
              {cards.length}{REVISE_PAGE_COPY.introTail}
            </p>
          </div>
        </div>

        <section className="ap-card todaycard" aria-labelledby="today">
          <div>
            <h2 id="today">
              {REVISE_PAGE_COPY.today.title.lead}<em>{REVISE_PAGE_COPY.today.title.accent}</em>
            </h2>
            <p>{REVISE_PAGE_COPY.today.text}</p>
            <div className="tk-act">
              <a className="btn" href="#deck">
                {REVISE_PAGE_COPY.today.start}
              </a>
              <Link className="tk-link" href={REVISE_PAGE_COPY.today.practice.href}>
                {REVISE_PAGE_COPY.today.practice.label}
              </Link>
            </div>
          </div>
          <div className="week" aria-hidden>
            <div className="week-card">
              <small>{REVISE_PAGE_COPY.week.label}</small>
              <div className="week-dots">
                {REVISE_PAGE_COPY.week.days.map((d, i) => (
                  <span key={i}>
                    <i className={i === 0 ? "on" : undefined} />
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <b>
              {REVISE_PAGE_COPY.week.title.lead}<em>{REVISE_PAGE_COPY.week.title.accent}</em>
            </b>
            <span>{REVISE_PAGE_COPY.week.text}</span>
          </div>
        </section>

        <section id="deck" className="ap-card">
          <Revise cards={cards} groups={groups} />
        </section>

        <h2 className="ap-h">{REVISE_PAGE_COPY.more}</h2>
        <div className="cb-grid">
          {REVISE_PAGE_COPY.cards.map((c, i) => (
            <Link key={c.href} href={c.href} className={`cb pc-${[5, 6, 4][i]}`}>
              <Book icon={c.icon} label={c.t.split(" ")[0].toUpperCase().slice(0, 11)} />
              <span className="cb-tx">
                <small>{REVISE_PAGE_COPY.cardTag}</small>
                <b>
                  <Title text={c.t} />
                </b>
                <span>{c.d}</span>
                <i>{REVISE_PAGE_COPY.open}</i>
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Footer>{REVISE_PAGE_COPY.footer}</Footer>
    </main>
  );
}
