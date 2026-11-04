import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Reading } from "@/components/Reading";
import { Code, Faq, Footer, Section, Table } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { swiftLines, swiftSource } from "@/lib/mobile-source";

export const dynamicParams = false;
export const generateStaticParams = () => MOBILE_PROBLEMS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = MOBILE_PROBLEMS.find((x) => x.id === id);
  return p ? { title: `${p.title} · mobile machine coding`, description: p.tagline } : {};
}

export default async function MobileProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = MOBILE_PROBLEMS.find((x) => x.id === id);
  if (!p) notFound();
  const i = MOBILE_PROBLEMS.indexOf(p);
  const next = MOBILE_PROBLEMS[(i + 1) % MOBILE_PROBLEMS.length];
  const source = swiftSource(p.file);
  const lines = swiftLines(p.file);
  const style = { "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties;
  const related = p.related.map((r) => MOBILE_PROBLEMS.find((x) => x.id === r)).filter((x): x is (typeof MOBILE_PROBLEMS)[number] => !!x);

  return (
    <main className="pattern-page" style={style}>
      <div className="pat-hero">
        <div className="kicker">
          <Link href="/mobile-coding">Mobile machine coding</Link> · {String(i + 1).padStart(2, "0")} of {MOBILE_PROBLEMS.length}
        </div>
        <h1>{p.title}</h1>
        <p className="dek">{p.tagline}</p>
        <div className="pat-meta">
          <span>
            <Icon name="clock" size={14} /> {p.minutes}-minute round · {p.level}
          </span>
          <span>Swift 6 · tested</span>
          <Link href="/reels/c-mobile">
            <Icon name="play" size={14} /> Watch as reels
          </Link>
        </div>
      </div>
      <Reading title={p.title} kind="Machine coding" articleId="deep-article">
        <Section id="mc-prompt" n={1} title="The prompt">
          <div className="ask">
            <span className="who">Interviewer</span>
            <p>{p.prompt}</p>
          </div>
          <h3>Requirements</h3>
          <ul className="req-list">
            {p.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
        <Section id="mc-clarify" n={2} title="Clarify first">
          <Table head={["You ask", "Interviewer answers"]} rows={p.clarify} />
        </Section>
        <Section id="mc-design" n={3} title="Design decisions">
          <div className="design-grid">
            {p.design.map(([h, d]) => (
              <div key={h}>
                <b>{h}</b>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </Section>
        <Section id="mc-code" n={4} title="The solution">
          <p>
            Complete, compiling Swift. It is built with Swift 6 strict concurrency checking and covered by the tests in{" "}
            <code>tests/mobile/main.swift</code>.
          </p>
          <Code sample={[p.title, "swift", source]} fileName={`${p.file}.swift`} hideTitle />
        </Section>
        <Section id="mc-walk" n={5} title="Line-by-line walkthrough">
          {p.steps.map((s, k) => (
            <div key={s.title} className="walk-step">
              <div className="ws-head">
                <span className="ws-n">{k + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.note}</p>
                </div>
              </div>
              <Code
                sample={[s.title, "swift", lines.slice(s.lines[0], s.lines[1] + 1).join("\n")]}
                startLine={s.lines[0] + 1}
                fileName={`${p.file}.swift`}
                hideTitle
              />
            </div>
          ))}
          <p>
            <b>Complexity:</b> {p.complexity}
          </p>
        </Section>
        <Section id="mc-edges" n={6} title="Edge cases to mention">
          <ul className="traps">
            {p.edgeCases.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Section>
        <Section id="mc-follow" n={7} title="Follow-up questions">
          <Faq items={p.followups} />
        </Section>
        <Section id="mc-android" n={8} title="On Android">
          <Table head={["Approach", "Kotlin / Android"]} rows={p.android} />
        </Section>
        {related.length > 0 && (
          <Section id="mc-related" n={9} title="Practise next">
            <div className="golinks">
              {related.map((r) => (
                <Link key={r.id} href={`/mobile-coding/${r.id}`}>
                  {r.title}
                </Link>
              ))}
            </div>
          </Section>
        )}
        <div className="next">
          <div>
            <div className="kicker">Next problem</div>
            <b>{next.title}</b>
          </div>
          <div className="btns">
            <Link className="btn ghost" href="/mobile-coding">
              All problems
            </Link>
            <Link className="btn" href={`/mobile-coding/${next.id}`}>
              Next →
            </Link>
          </div>
        </div>
      </Reading>
      <Footer>AI Engineer · {p.title}</Footer>
    </main>
  );
}
