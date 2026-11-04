import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { Reading } from "@/components/Reading";
import { Code, Footer, Section } from "@/components/ui";
import { Icon } from "@/components/Icons";

export const dynamicParams = false;
export const generateStaticParams = () => PATTERNS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PATTERNS.find((x) => x.id === id);
  return p ? { title: `${p.name} pattern`, description: p.tagline } : {};
}

export default async function PatternPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = PATTERNS.find((x) => x.id === id);
  if (!p) notFound();
  const i = PATTERNS.indexOf(p);
  const next = PATTERNS[(i + 1) % PATTERNS.length];
  const style = { "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties;
  const more = MORE_PROBLEMS[p.id] ?? [];
  const worked = new Set([p.worked.problem, ...more.map((m) => m.problem)]);
  const practice = p.practice.filter((x) => !worked.has(x.name));
  return (
    <main className="pattern-page" style={style}>
      <div className="pat-hero">
        <div className="kicker">
          <Link href="/coding">Coding patterns</Link> · {String(i + 1).padStart(2, "0")} of {PATTERNS.length}
        </div>
        <h1>{p.name}</h1>
        <p className="dek">{p.tagline}</p>
        <div className="pat-meta">
          <span>
            <Icon name="clock" size={14} /> {p.complexity}
          </span>
          <Link href={`/reels/c-patterns`}>
            <Icon name="play" size={14} /> Watch as reels
          </Link>
        </div>
      </div>
      <Reading title={`${p.name} pattern`} kind="Pattern" articleId="deep-article">
        <Section id="pt-signals" n={1} title="When to reach for it">
          <div className="sig-chips">
            {p.signals.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <p className="lead">{p.idea}</p>
        </Section>
        <Section id="pt-template" n={2} title="The template">
          <p>Memorise this shape. Most problems in this family are this code plus one twist.</p>
          <Code sample={[p.template.title, "python", p.template.code]} />
          <ol className="flow-notes">
            {p.template.beats.map((b) => (
              <li key={b.note}>{b.note}</li>
            ))}
          </ol>
        </Section>
        <Section id="pt-worked" n={3} title={`Worked: ${p.worked.problem}`}>
          <div className="callout">
            <b className="t">Problem</b>
            {p.worked.prompt}
          </div>
          <h3>Approach</h3>
          <ol>
            {p.worked.approach.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
          <Code sample={[p.worked.problem, "python", p.worked.code]} />
          <p>
            <b>Complexity:</b> {p.worked.complexity}
          </p>
        </Section>
        <Section id="pt-more" n={4} title={`${more.length} more worked problems`}>
          {more.map((m, k) => (
            <div key={m.problem} className="more-prob" id={`more-${k}`}>
              <div className="mp-head">
                <span className={"pr-lv lv-" + m.level.toLowerCase()}>{m.level}</span>
                <h3>{m.problem}</h3>
              </div>
              <p className="mp-prompt">{m.prompt}</p>
              <ol className="mp-approach">
                {m.approach.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
              <Code sample={[m.problem, "python", m.code]} hideTitle />
              <p className="mp-cx">
                <b>Complexity:</b> {m.complexity}
              </p>
            </div>
          ))}
        </Section>
        {practice.length > 0 && (
          <Section id="pt-practice" n={5} title="Practise on your own">
            <div className="practice">
              {practice.map((x) => (
                <div key={x.name} className={"pr-item lv-" + x.level.toLowerCase()}>
                  <span className="pr-lv">{x.level}</span>
                  <b>{x.name}</b>
                  <details>
                    <summary>Hint</summary>
                    <p>{x.hint}</p>
                  </details>
                </div>
              ))}
            </div>
          </Section>
        )}
        <Section id="pt-traps" n={practice.length ? 6 : 5} title="Traps">
          <ul className="traps">
            {p.pitfalls.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
        <div className="next">
          <div>
            <div className="kicker">Next pattern</div>
            <b>{next.name}</b>
          </div>
          <div className="btns">
            <Link className="btn ghost" href="/coding">
              All patterns
            </Link>
            <Link className="btn" href={`/coding/${next.id}`}>
              Next →
            </Link>
          </div>
        </div>
      </Reading>
      <Footer>AI Engineer · {p.name}</Footer>
    </main>
  );
}
