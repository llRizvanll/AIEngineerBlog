import { PageTrail } from "@/components/PageTrail";
import { PageEnd } from "@/components/PageEnd";
import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleLd } from "@/lib/site";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { PATTERNS, WORKED_BEATS } from "@/content/coding";
import { PATTERN_BASICS } from "@/content/basics";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { Reading } from "@/components/Reading";
import { Code, Faq, Footer } from "@/components/ui";
import { TEMPLATE_ALT, variantsOf, WORKED_ALT } from "@/content/coding-alt";
import { Chapters, type ChapterPart } from "@/components/Chapters";
import { Icon } from "@/components/Icons";
import { AssetMeta } from "@/components/AssetMeta";
import { CODING_DETAIL_COPY } from "@/content/pages/coding-detail";

export const dynamicParams = false;
export const generateStaticParams = () => PATTERNS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = PATTERNS.find((x) => x.id === id);
  return p ? { title: `${p.name} pattern`, description: `The ${p.name} pattern for coding interviews: ${p.tagline}` } : {};
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
  const basics = PATTERN_BASICS[p.id];
  const workedSteps = WORKED_BEATS[p.id] ?? [];
  const parts: ChapterPart[] = [
    {
      key: "basics",
      lead: CODING_DETAIL_COPY.parts.basics.lead,
      sections: [
        {
          id: "idea",
          title: CODING_DETAIL_COPY.sections["basics.idea"].title,
          intro: CODING_DETAIL_COPY.sections["basics.idea"].intro,
          body: (
            <>
              <p className="lead">{p.idea}</p>
              {basics && (
                <div className="why-box">
                  <b>Why it works</b>
                  <p>{basics.why}</p>
                </div>
              )}
              <p className="cx-line">
                <b>Typical cost:</b> {p.complexity}
              </p>
            </>
          ),
        },
        {
          id: "signals",
          title: CODING_DETAIL_COPY.sections["basics.signals"].title,
          intro: CODING_DETAIL_COPY.sections["basics.signals"].intro,
          body: (
            <div className="sig-chips">
              {p.signals.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      key: "question",
      lead: CODING_DETAIL_COPY.parts.question.lead,
      sections: [
        {
          id: "worked",
          title: p.worked.problem,
          intro: CODING_DETAIL_COPY.sections["question.worked"].intro,
          body: (
            <>
              <div className="ask">
                <span className="who">Problem</span>
                <p>{p.worked.prompt}</p>
              </div>
              <h3>Plan before you code</h3>
              <ol className="plan-steps">
                {p.worked.approach.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
            </>
          ),
        },
      ],
    },
    {
      key: "detail",
      lead: CODING_DETAIL_COPY.parts.detail.lead,
      sections: [
        {
          id: "template",
          title: CODING_DETAIL_COPY.sections["detail.template"].title,
          intro: CODING_DETAIL_COPY.sections["detail.template"].intro,
          body: (
            <>
              <Code sample={[p.template.title, "ts", p.template.code]} variants={variantsOf(TEMPLATE_ALT[p.id])} />
              <ol className="flow-notes">
                {p.template.beats.map((b) => (
                  <li key={b.note}>{b.note}</li>
                ))}
              </ol>
            </>
          ),
        },
        {
          id: "solution",
          title: CODING_DETAIL_COPY.sections["detail.solution"].title,
          intro: CODING_DETAIL_COPY.sections["detail.solution"].intro,
          body: (
            <>
              <Code sample={[p.worked.problem, "ts", p.worked.code]} variants={variantsOf(WORKED_ALT[p.id])} />
              {workedSteps.length > 0 && (
                <>
                  <h3>Step by step</h3>
                  <ol className="flow-notes">
                    {workedSteps.map((b) => (
                      <li key={b.note}>{b.note}</li>
                    ))}
                  </ol>
                </>
              )}
              <p className="cx-line">
                <b>Complexity:</b> {p.worked.complexity}
              </p>
            </>
          ),
        },
      ],
    },
    {
      key: "qa",
      lead: CODING_DETAIL_COPY.parts.qa.lead,
      sections: [
        ...(basics ? [{ id: "qa", title: CODING_DETAIL_COPY.sections["qa.qa"].title, intro: CODING_DETAIL_COPY.sections["qa.qa"].intro, body: <Faq items={basics.qa} /> }] : []),
        ...(practice.length
          ? [
              {
                id: "practice",
                title: CODING_DETAIL_COPY.sections["qa.practice"].title,
                intro: CODING_DETAIL_COPY.sections["qa.practice"].intro,
                body: (
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
                ),
              },
            ]
          : []),
      ],
    },
    {
      key: "more",
      lead: CODING_DETAIL_COPY.parts.more.lead,
      sections: [
        ...(more.length
          ? [
              {
                id: "more",
                title: `${more.length} more worked problems`,
                intro: CODING_DETAIL_COPY.sections["more.more"].intro,
                body: (
                  <>
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
                        <Code sample={[m.problem, "ts", m.code]} hideTitle />
                        <p className="mp-cx">
                          <b>Complexity:</b> {m.complexity}
                        </p>
                      </div>
                    ))}
                  </>
                ),
              },
            ]
          : []),
        {
          id: "traps",
          title: CODING_DETAIL_COPY.sections["more.traps"].title,
          intro: CODING_DETAIL_COPY.sections["more.traps"].intro,
          body: (
            <ul className="traps">
              {p.pitfalls.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ),
        },
      ],
    },
  ];

  return (
    <main className="pattern-page" style={style}>
      <JsonLd data={articleLd({ title: `${p.name} pattern`, description: p.tagline, path: `/coding/${p.id}`, section: "Coding patterns" })} />
      <div className="pat-hero">
        <div className="kicker">
          <Link href="/coding">Coding patterns</Link> · {String(i + 1).padStart(2, "0")} of {PATTERNS.length}
        </div>
        <h1>{p.name}</h1>
        <p className="dek">{p.tagline}</p>
        <AssetMeta href={`/coding/${p.id}`} />
        <PageTrail href={`/coding/${p.id}`} />
        <StudyWithAI />
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
        <Chapters parts={parts} prefix="pt" />
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
      <PageEnd href={`/coding/${p.id}`} />
      <Footer>AI Engineer · {p.name}</Footer>
    </main>
  );
}
