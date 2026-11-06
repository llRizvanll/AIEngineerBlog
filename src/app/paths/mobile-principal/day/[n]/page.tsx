import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleLd } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DAY_ANSWERS, DAYS, THREE_QUESTIONS, type DayItem } from "@/content/programme/mobile-principal";
import { LESSONS } from "@/content/programme/lessons";
import { LESSON_CODE } from "@/content/code-docs";
import { CodeWalks } from "@/components/CodeWalk";
import { Code, Faq, Footer } from "@/components/ui";
import { DayChecklist, DayComplete, DayRubric } from "@/components/programme/DayPlan";
import { titleFor } from "@/lib/programme";
import { dayHref, PROGRAMME_HREF } from "@/lib/routes";

export const dynamicParams = false;
export const generateStaticParams = () => DAYS.map((d) => ({ n: String(d.n) }));

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const d = DAYS.find((x) => String(x.n) === n);
  return d ? { title: `Day ${d.n}: ${d.title}`, description: d.question } : {};
}

function Part({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="ls-part">
      <h2>
        <span>Part {n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const d = DAYS.find((x) => String(x.n) === n);
  const lesson = d && LESSONS[d.n];
  if (!d || !lesson) notFound();
  const next = DAYS.find((x) => x.n === d.n + 1);
  const prev = DAYS.find((x) => x.n === d.n - 1);
  const answers = DAY_ANSWERS[d.n];
  const withTitle = (i: DayItem) => ({ ...i, title: titleFor(i.href) });
  const practise = d.items.filter((i) => i.kind !== "Read").map(withTitle);
  const reference = d.items.filter((i) => i.kind === "Read").map(withTitle);

  return (
    <main className="ls">
      <JsonLd data={articleLd({ title: `Day ${d.n}: ${d.title}`, description: d.question, path: dayHref(d.n), section: "Mobile principal in two weeks" })} />
      <article className="ls-body">
        <p className="ls-kicker">
          <Link href={PROGRAMME_HREF}>Two-week programme</Link> · Day {d.n} of {DAYS.length}
        </p>
        <h1>{d.title}</h1>

        <Part n={1} title="Basics">
          {lesson.plain.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <h3>Words you need today</h3>
          <dl className="ls-words">
            {lesson.words.map(([t, x]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{x}</dd>
              </div>
            ))}
          </dl>
          <h3>The story</h3>
          {d.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Part>

        <Part n={2} title="Today's question">
          <p className="ls-q">{d.question}</p>
          <p>By the end of this lesson, you should be able to:</p>
          <ul>
            {d.canDo.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Part>

        <Part n={3} title="In detail">
          <h3>Step by step</h3>
          <ol className="ls-steps">
            {lesson.steps.map(([t, x]) => (
              <li key={t}>
                <b>{t}.</b> {x}
              </li>
            ))}
          </ol>
          {d.idea.map(([h, ps]) => (
            <div key={h}>
              <h3>{h}</h3>
              {ps.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ))}
          {d.artifact && (
            <>
              <h3>{d.artifact.title}</h3>
              <Code sample={[d.artifact.title, d.artifact.lang, d.artifact.code]} hideTitle />
              <p className="ls-note">{d.artifact.note}</p>
            </>
          )}
          <h2 className="ls-sub">The code, explained</h2>
          <p>This is the real code, and our tests run it. Read each block, then the notes under it.</p>
          <CodeWalks ids={LESSON_CODE[d.n] ?? []} />
          <h3>What can go wrong</h3>
          <dl className="ls-words">
            {lesson.failures.map(([t, x]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{x}</dd>
              </div>
            ))}
          </dl>
          {d.decisions.length > 0 && (
            <>
              <h3>Decisions to defend</h3>
              <ul className="ls-decisions">
                {d.decisions.map(([q, chosen, rejected, why]) => (
                  <li key={q}>
                    <b>{q.endsWith("?") ? q : `${q}:`}</b> {chosen}
                    {rejected !== "—" ? `, not ${rejected.charAt(0).toLowerCase() + rejected.slice(1)}` : ""}. {why}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Part>

        <Part n={4} title="Questions and answers">
          <p>Answer out loud first, then open each one.</p>
          <Faq items={d.check} />
        </Part>

        <Part n={5} title="Going further">
          {answers && (
            <>
              <h3>The three questions, for today</h3>
              <dl className="ls-words">
                {THREE_QUESTIONS.map(([q], i) => (
                  <div key={q}>
                    <dt>{q}</dt>
                    <dd>{answers[i]}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {practise.length > 0 && (
            <>
              <h3>Practise</h3>
              <DayChecklist day={d.n} items={practise} />
            </>
          )}
          {d.rubric && (
            <>
              <h3>Score yourself</h3>
              <p>Tick a line only if you did it without prompting.</p>
              <DayRubric day={d.n} lines={d.rubric} />
            </>
          )}
          {reference.length > 0 && (
            <details className="ls-ref">
              <summary>Optional reference pages</summary>
              <p>You don&rsquo;t need these for the lesson. They hold more detail if you want it later.</p>
              <ul>
                {reference.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href}>{r.title}</Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="ls-tomorrow">{d.tomorrow}</p>
          <DayComplete day={d.n} total={DAYS.length} nextTitle={next?.title} />
        </Part>

        {prev && (
          <p className="ls-prev">
            <Link href={dayHref(prev.n)}>← Day {prev.n}: {prev.title}</Link>
          </p>
        )}
      </article>
      <Footer>AI Engineer · Day {d.n} of {DAYS.length}</Footer>
    </main>
  );
}
