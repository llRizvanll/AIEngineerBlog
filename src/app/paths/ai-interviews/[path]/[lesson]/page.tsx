import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CodeWalks } from "@/components/CodeWalk";
import { JsonLd } from "@/components/JsonLd";
import { Code, Faq, Footer, Table } from "@/components/ui";
import { LessonComplete, LessonRubric } from "@/components/ai-paths/Progress";
import { PromptCard } from "@/components/ai-paths/PromptCard";
import { AI_PATHS, allLessons, getPath } from "@/content/ai-interviews";
import { CHECKED, SOURCES } from "@/content/ai-interviews/sources";
import { aiLessonHref, aiPathHref } from "@/lib/routes";
import { articleLd, breadcrumbLd, faqLd } from "@/lib/site";
import { AI_BASICS_HREF, AI_PATHS_HREF } from "@/config/constants";

export const dynamicParams = false;
export const generateStaticParams = () => allLessons().map(({ path, lesson }) => ({ path: path.id, lesson: lesson.slug }));

const find = (pathId: string, slug: string) => {
  const path = getPath(pathId);
  const lesson = path?.lessons.find((l) => l.slug === slug);
  return path && lesson ? { path, lesson } : null;
};

export async function generateMetadata({ params }: { params: Promise<{ path: string; lesson: string }> }): Promise<Metadata> {
  const { path, lesson } = await params;
  const hit = find(path, lesson);
  return hit ? { title: hit.lesson.title, description: hit.lesson.question } : {};
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

export default async function LessonPage({ params }: { params: Promise<{ path: string; lesson: string }> }) {
  const { path: pathId, lesson: slug } = await params;
  const hit = find(pathId, slug);
  if (!hit) notFound();
  const { path, lesson: l } = hit;
  const at = path.lessons.indexOf(l);
  const prev = path.lessons[at - 1];
  const nextInPath = path.lessons[at + 1];
  const nextPath = AI_PATHS[AI_PATHS.indexOf(path) + 1];
  const nextHref = nextInPath ? aiLessonHref(path.id, nextInPath.slug) : nextPath ? aiPathHref(nextPath.id) : undefined;
  const nextTitle = nextInPath ? `Next: ${nextInPath.stop}` : nextPath ? `Next path: ${nextPath.short}` : undefined;
  const href = aiLessonHref(path.id, l.slug);
  const id = `${path.id}/${l.slug}`;
  const sources = l.sources.map((k) => SOURCES[k]);

  return (
    <main className="ls">
      <JsonLd data={articleLd({ title: l.title, description: l.question, path: href, section: path.title })} />
      <JsonLd data={faqLd(l.check)} />
      <JsonLd data={breadcrumbLd([["Home", "/"], ["AI interview paths", AI_PATHS_HREF], [path.title, aiPathHref(path.id)], [l.title, href]])} />
      <article className="ls-body">
        <p className="ls-kicker">
          <Link href={aiPathHref(path.id)}>{path.title}</Link> · Lesson {at + 1} of {path.lessons.length} · {l.minutes} min
        </p>
        <h1>{l.title}</h1>
        <StudyWithAI root=".ls-body" />

        <Part n={1} title="Basics">
          {l.plain.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <h3>Words you need</h3>
          <dl className="ls-words">
            {l.words.map(([t, x]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{x}</dd>
              </div>
            ))}
          </dl>
          <h3>A worked example</h3>
          {l.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Part>

        <Part n={2} title="The question">
          <p className="ls-q">{l.question}</p>
          <p>By the end of this lesson, you should be able to:</p>
          <ul>
            {l.canDo.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Part>

        <Part n={3} title="In detail">
          <h3>Step by step</h3>
          <ol className="ls-steps">
            {l.steps.map(([t, x]) => (
              <li key={t}>
                <b>{t}.</b> {x}
              </li>
            ))}
          </ol>
          {l.idea.map(([h, ps]) => (
            <div key={h}>
              <h3>{h}</h3>
              {ps.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ))}
          {l.table && (
            <>
              <h3>{l.table.title}</h3>
              {l.table.note && <p className="ls-note">{l.table.note}</p>}
              <Table head={l.table.head} rows={l.table.rows} />
            </>
          )}
          {l.prompts && l.prompts.length > 0 && (
            <>
              <h3>Prompts to copy</h3>
              {l.prompts.map((p) => (
                <PromptCard key={p.title} title={p.title} note={p.note} text={p.text} />
              ))}
            </>
          )}
          {(l.code.length > 0 || l.sample) && (
            <>
              <h2 className="ls-sub">The code, explained</h2>
              {l.code.length > 0 && <p>This is real code, and our tests run it, including the buggy versions, to prove the bugs are real.</p>}
              <CodeWalks ids={l.code} />
              {l.sample && (
                <div className="cw">
                  <h3>{l.sample.title}</h3>
                  <Code sample={[l.sample.title, l.sample.lang, l.sample.code]} hideTitle />
                  <p className="cw-proof">{l.sample.note}</p>
                </div>
              )}
            </>
          )}
          <h3>What can go wrong</h3>
          <dl className="ls-words">
            {l.failures.map(([t, x]) => (
              <div key={t}>
                <dt>{t}</dt>
                <dd>{x}</dd>
              </div>
            ))}
          </dl>
        </Part>

        <Part n={4} title="Questions and answers">
          <p>Answer out loud first, then open each one.</p>
          <Faq items={l.check} />
        </Part>

        <Part n={5} title="Going further">
          <h3>
            Drill: {l.drill.title} ({l.drill.minutes} min)
          </h3>
          <ol className="ls-steps">
            {l.drill.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {l.rubric && (
            <>
              <h3>Score yourself</h3>
              <p>Tick a line only if you did it without prompting.</p>
              <LessonRubric id={id} lines={l.rubric} />
            </>
          )}
          <p>
            Keep the fundamentals fresh with the <Link href={AI_BASICS_HREF}>critical basics</Link>.
          </p>
          {sources.length > 0 && (
            <details className="ls-ref ip-sources" open>
              <summary>Who says so</summary>
              <p>Checked in {CHECKED}. Vendors and individuals often report what candidates told them, so treat their details as reports.</p>
              <ul>
                {sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>{" "}
                    <small>
                      {s.who}
                      {s.date ? `, ${s.date}` : ""}
                    </small>
                  </li>
                ))}
              </ul>
            </details>
          )}
          <p className="ls-tomorrow">{l.next}</p>
          <LessonComplete id={id} nextHref={nextHref} nextTitle={nextTitle} backHref={AI_PATHS_HREF} />
        </Part>

        {prev && (
          <p className="ls-prev">
            <Link href={aiLessonHref(path.id, prev.slug)}>← {prev.title}</Link>
          </p>
        )}
      </article>
      <Footer>AI Engineer · {path.title}</Footer>
    </main>
  );
}
