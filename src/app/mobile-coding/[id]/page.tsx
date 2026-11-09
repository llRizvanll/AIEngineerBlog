import { PageTrail } from "@/components/PageTrail";
import type { CodeVariant } from "@/config/languages";
import { PageEnd } from "@/components/PageEnd";
import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleLd } from "@/lib/site";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { Reading } from "@/components/Reading";
import { Code, Faq, Footer, Table } from "@/components/ui";
import { Chapters, ConceptGrid, type ChapterPart } from "@/components/Chapters";
import { MOBILE_CONCEPTS } from "@/content/basics";
import { Icon } from "@/components/Icons";
import { AssetMeta } from "@/components/AssetMeta";
import { PathLink } from "@/components/programme/PathLink";
import { altSource, kotlinLines, kotlinSource } from "@/lib/mobile-source";
import { MOBILE_DETAIL_COPY } from "@/content/pages/mobile-coding-detail";

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
  const source = kotlinSource(p.file);
  const lines = kotlinLines(p.file);
  const variants: CodeVariant[] = [
    { id: "java", src: altSource(p.file, "java"), fileName: `${p.file}.java` },
    { id: "ts", src: altSource(p.file, "ts"), fileName: `${p.file}.ts` },
  ];
  const style = { "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties;
  const related = p.related.map((r) => MOBILE_PROBLEMS.find((x) => x.id === r)).filter((x): x is (typeof MOBILE_PROBLEMS)[number] => !!x);

  const parts: ChapterPart[] = [
    {
      key: "basics",
      lead: MOBILE_DETAIL_COPY.parts.basics.lead,
      sections: [
        { id: "concepts", title: MOBILE_DETAIL_COPY.sections["basics.concepts"].title, intro: MOBILE_DETAIL_COPY.sections["basics.concepts"].intro, body: <ConceptGrid items={MOBILE_CONCEPTS[p.id] ?? []} /> },
      ],
    },
    {
      key: "question",
      lead: MOBILE_DETAIL_COPY.parts.question.lead,
      sections: [
        {
          id: "prompt",
          title: MOBILE_DETAIL_COPY.sections["question.prompt"].title,
          intro: MOBILE_DETAIL_COPY.sections["question.prompt"].intro,
          body: (
            <>
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
            </>
          ),
        },
        { id: "clarify", title: MOBILE_DETAIL_COPY.sections["question.clarify"].title, intro: MOBILE_DETAIL_COPY.sections["question.clarify"].intro, body: <Table head={["You ask", "Interviewer answers"]} rows={p.clarify} /> },
      ],
    },
    {
      key: "detail",
      lead: MOBILE_DETAIL_COPY.parts.detail.lead,
      sections: [
        {
          id: "design",
          title: MOBILE_DETAIL_COPY.sections["detail.design"].title,
          intro: MOBILE_DETAIL_COPY.sections["detail.design"].intro,
          body: (
            <div className="design-grid">
              {p.design.map(([h, d]) => (
                <div key={h}>
                  <b>{h}</b>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "code",
          title: MOBILE_DETAIL_COPY.sections["detail.code"].title,
          intro: MOBILE_DETAIL_COPY.sections["detail.code"].intro,
          body: <Code sample={[p.title, "kotlin", source]} fileName={`${p.file}.kt`} hideTitle variants={variants} />,
        },
        {
          id: "walk",
          title: MOBILE_DETAIL_COPY.sections["detail.walk"].title,
          intro: MOBILE_DETAIL_COPY.sections["detail.walk"].intro,
          body: (
            <>
              {p.steps.map((s, k) => (
                <div key={s.title} className="walk-step">
                  <div className="ws-head">
                    <span className="ws-n">{k + 1}</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.note}</p>
                    </div>
                  </div>
                  <Code sample={[s.title, "kotlin", lines.slice(s.lines[0], s.lines[1] + 1).join("\n")]} startLine={s.lines[0] + 1} fileName={`${p.file}.kt`} hideTitle />
                </div>
              ))}
              <p className="cx-line">
                <b>Complexity:</b> {p.complexity}
              </p>
            </>
          ),
        },
      ],
    },
    {
      key: "qa",
      lead: MOBILE_DETAIL_COPY.parts.qa.lead,
      sections: [{ id: "follow", title: MOBILE_DETAIL_COPY.sections["qa.follow"].title, body: <Faq items={p.followups} /> }],
    },
    {
      key: "more",
      lead: MOBILE_DETAIL_COPY.parts.more.lead,
      sections: [
        {
          id: "edges",
          title: MOBILE_DETAIL_COPY.sections["more.edges"].title,
          intro: MOBILE_DETAIL_COPY.sections["more.edges"].intro,
          body: (
            <ul className="traps">
              {p.edgeCases.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ),
        },
        { id: "ios", title: MOBILE_DETAIL_COPY.sections["more.ios"].title, intro: MOBILE_DETAIL_COPY.sections["more.ios"].intro, body: <Table head={["Approach", "Swift / iOS"]} rows={p.ios} /> },
        ...(related.length
          ? [
              {
                id: "related",
                title: MOBILE_DETAIL_COPY.sections["more.related"].title,
                body: (
                  <div className="golinks">
                    {related.map((r) => (
                      <Link key={r.id} href={`/mobile-coding/${r.id}`}>
                        {r.title}
                      </Link>
                    ))}
                  </div>
                ),
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <main className="pattern-page" style={style}>
      <JsonLd data={articleLd({ title: p.title, description: p.tagline, path: `/mobile-coding/${p.id}`, section: "Machine coding" })} />
      <div className="pat-hero">
        <div className="kicker">
          <Link href="/mobile-coding">Mobile machine coding</Link> · {String(i + 1).padStart(2, "0")} of {MOBILE_PROBLEMS.length}
        </div>
        <h1>{p.title}</h1>
        <p className="dek">{p.tagline}</p>
        <AssetMeta href={`/mobile-coding/${p.id}`} />
        <PageTrail href={`/mobile-coding/${p.id}`} />
        <PathLink href={`/mobile-coding/${p.id}`} />
        <StudyWithAI />
        <div className="pat-meta">
          <span>
            <Icon name="clock" size={14} /> {p.minutes}-minute round · {p.level}
          </span>
          <span>Kotlin · coroutines · tested</span>
          <Link href="/reels/c-mobile">
            <Icon name="play" size={14} /> Watch as reels
          </Link>
        </div>
      </div>
      <Reading title={p.title} kind="Machine coding" articleId="deep-article">
        <Chapters parts={parts} prefix="mc" />
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
      <PageEnd href={`/mobile-coding/${p.id}`} />
      <Footer>AI Engineer · {p.title}</Footer>
    </main>
  );
}
