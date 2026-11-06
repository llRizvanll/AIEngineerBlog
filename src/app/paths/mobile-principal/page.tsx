import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { DAYS, JOURNEY, THREADS, WEEKS } from "@/content/programme/mobile-principal";
import { EditJourney } from "@/components/programme/EditJourney";
import { ProgrammeContinue, ProgrammeDays, type DayRow } from "@/components/programme/ProgrammeDays";

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
            <Link href="/aiengine">Curriculum</Link> · Two-week programme
          </div>
          <h1>
            Mobile principal <span className="serif grad-text">in two weeks.</span>
          </h1>
          <p>
            One edit, made in a basement with no signal, followed all the way to a supervisor&rsquo;s tablet. Then the same parts rebuilt as chat, checkout, a feed and a release platform. Each day is one complete lesson, from the basics up, and picks up where the last one stopped. You can read it with nothing else open.
          </p>
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
          <h2>See the whole journey</h2>
          <span>Priya changes valve 3. Step through what happens.</span>
        </div>
        <EditJourney stops={JOURNEY} />

        <div className="section-h">
          <h2>Six ideas that connect it all</h2>
          <span>The same parts, in different products</span>
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
      <Footer>AI Engineer · two-week programme · progress stays in this browser</Footer>
    </main>
  );
}
