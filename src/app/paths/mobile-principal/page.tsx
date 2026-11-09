import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { DAYS, JOURNEY, THREADS, WEEKS } from "@/content/programme/mobile-principal";
import { EditJourney } from "@/components/programme/EditJourney";
import { ProgrammeContinue, ProgrammeDays, type DayRow } from "@/components/programme/ProgrammeDays";
import { PROGRAMME_PAGE_COPY } from "@/content/pages/paths-mobile-principal";

export const metadata: Metadata = {
  title: "Mobile principal in two weeks",
  description: "Follow one offline edit from a tap in a basement to a supervisor's tablet, then reuse the same parts to design chat, checkout, a feed and a release platform.",
};

export default function ProgrammePage() {
  const rows: DayRow[] = DAYS.map((d) => ({
    n: d.n,
    week: d.week,
    stop: d.stop,
    title: d.title,
    question: d.question,
    mock: !!d.rubric,
  }));
  return (
    <main className="pg">
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href={PROGRAMME_PAGE_COPY.curriculum.href}>{PROGRAMME_PAGE_COPY.curriculum.label}</Link>{PROGRAMME_PAGE_COPY.kickerTail}
          </div>
          <h1>
            {PROGRAMME_PAGE_COPY.title.lead}<span className="serif grad-text">{PROGRAMME_PAGE_COPY.title.accent}</span>
          </h1>
<p>{PROGRAMME_PAGE_COPY.intro}</p>
          <StudyWithAI title={PROGRAMME_PAGE_COPY.studyTitle} />
          <ProgrammeContinue days={rows} />
        </section>

        {([1, 2] as const).map((w) => (
          <section key={w}>
            <div className="section-h">
              <h2>{WEEKS[w].title}</h2>
            </div>
            <p className="pg-week">{WEEKS[w].blurb}</p>
            <ProgrammeDays days={rows.filter((r) => r.week === w)} />
          </section>
        ))}

        <div className="section-h">
          <h2>{PROGRAMME_PAGE_COPY.journey.title}</h2>
          <span>{PROGRAMME_PAGE_COPY.journey.blurb}</span>
        </div>
        <EditJourney stops={JOURNEY} />

        <div className="section-h">
          <h2>{PROGRAMME_PAGE_COPY.threads.title}</h2>
          <span>{PROGRAMME_PAGE_COPY.threads.blurb}</span>
        </div>
        <div className="pg-threads">
          {THREADS.map((t) => (
            <section key={t.idea}>
              <h3>{t.idea}</h3>
              <p>{t.rule}</p>
              <ul>
                {t.uses.map(([where, how, href]) => (
                  <li key={where + how}>
                    <Link href={href}>
                      <b>{where}</b>
                      <span>{how}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <Footer>{PROGRAMME_PAGE_COPY.footer}</Footer>
    </main>
  );
}
