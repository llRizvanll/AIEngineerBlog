import { PageTrail } from "@/components/PageTrail";
import { PageEnd } from "@/components/PageEnd";
import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleLd } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASES, CRITICAL, DEEP, FRONTEND, getCase } from "@/lib/content";
import { CASE_CONCEPTS } from "@/content/basics";
import { ArchSvg, Figure, SeqSvg } from "@/components/Diagrams";
import { Code, Faq, Footer, Table } from "@/components/ui";
import { ConceptGrid } from "@/components/Chapters";
import { CodeWalks } from "@/components/CodeWalk";
import { PAGE_CODE } from "@/content/code-docs";
import { AssetMeta } from "@/components/AssetMeta";
import { PathLink } from "@/components/programme/PathLink";
import { CaseRound, type RoundPart } from "@/components/interview/CaseRound";
import { CritItem } from "@/components/interview/CritItem";
import type { InterviewCase } from "@/content/types";
import { TIME_PLAN, CRIT_TOPIC } from "@/content/page-copy";
import { INTERVIEW_DETAIL_COPY } from "@/content/pages/interview-detail";

export const dynamicParams = false;
export const generateStaticParams = () => CASES.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = getCase((await params).id);
  return c ? { title: c.title, description: c.prompt } : {};
}

function parts(c: InterviewCase): RoundPart[] {
  const F = FRONTEND[c.id];
  const related = DEEP.filter((d) => (d.group === "ai") === (c.track === "AI"));
  const crit = (CRITICAL[c.id] || []).map((q, i) => ({ q, i }));
  const critGroups = Object.entries(
    crit.reduce<Record<string, typeof crit>>((acc, x) => ((acc[x.q[0]] ??= []).push(x), acc), {})
  );

  return [
    {
      key: "basics",
      lead: INTERVIEW_DETAIL_COPY.parts.basics.lead,
      sections: [
        {
          key: "simple",
          title: INTERVIEW_DETAIL_COPY.sections["simple.x"].title,
          intro: INTERVIEW_DETAIL_COPY.sections["simple.x"].intro,
          body: F ? (
            <>
              <p className="lead">{F.simple.what}</p>
              <h3>Who uses it</h3>
              <ul className="who">{F.simple.who.map((w) => <li key={w}>{w}</li>)}</ul>
              <h3>A day in the life</h3>
              <ol className="journey">{F.simple.journey.map((j) => <li key={j}>{j}</li>)}</ol>
              <h3>Why it is hard</h3>
              <div className="hard">
                {F.simple.hard.map(([h, p]) => (
                  <div key={h}>
                    <b>{h}</b>
                    <p>{p}</p>
                  </div>
                ))}
              </div>
              <div className="analogy">
                <b>Think of it like this</b>
                <p>{F.simple.analogy}</p>
              </div>
            </>
          ) : (
            <p className="lead">{c.prompt}</p>
          ),
        },
        {
          key: "concepts",
          title: INTERVIEW_DETAIL_COPY.sections["concepts.x"].title,
          intro: INTERVIEW_DETAIL_COPY.sections["concepts.x"].intro,
          body: (
            <>
              <ConceptGrid items={CASE_CONCEPTS[c.id] ?? []} />
              <p className="go-h">Learn them properly in the deep dives:</p>
              <div className="golinks">
                {related.map((d) => (
                  <Link key={d.id} href={`/deep/${d.id}`}>
                    {d.title}
                  </Link>
                ))}
              </div>
            </>
          ),
        },
      ],
    },
    {
      key: "question",
      lead: INTERVIEW_DETAIL_COPY.parts.question.lead,
      sections: [
        {
          key: "brief",
          title: INTERVIEW_DETAIL_COPY.sections["brief.x"].title,
          intro: INTERVIEW_DETAIL_COPY.sections["brief.x"].intro,
          body: (
            <>
              <div className="ask">
                <span className="who">Interviewer</span>
                <p>{c.prompt}</p>
              </div>
              <p className="testing">
                <b>What it tests:</b> {c.why}
              </p>
              {F && (
                <p className="oneline">
                  <b>The answer in one sentence.</b> {F.simple.oneLine}
                </p>
              )}
              <h3>How to spend the {c.minutes} minutes</h3>
              <ol className="time-plan">
                {TIME_PLAN.map(([name, share, what]) => (
                  <li key={name}>
                    <b>{name}</b>
                    <span className="tp-min">~{Math.round(share * c.minutes)} min</span>
                    <span>{what}</span>
                  </li>
                ))}
              </ol>
            </>
          ),
        },
        {
          key: "clarify",
          title: INTERVIEW_DETAIL_COPY.sections["clarify.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["clarify.x"].prompt,
          intro: INTERVIEW_DETAIL_COPY.sections["clarify.x"].intro,
          body: <Table head={["You ask", "Interviewer answers"]} rows={c.clarify} />,
        },
        {
          key: "estimate",
          title: INTERVIEW_DETAIL_COPY.sections["estimate.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["estimate.x"].prompt,
          intro: INTERVIEW_DETAIL_COPY.sections["estimate.x"].intro,
          body: <Table head={["Metric", "Estimate", "How"]} rows={c.numbers} />,
        },
      ],
    },
    {
      key: "detail",
      lead: INTERVIEW_DETAIL_COPY.parts.detail.lead,
      sections: [
        {
          key: "arch",
          title: INTERVIEW_DETAIL_COPY.sections["arch.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["arch.x"].prompt,
          intro: c.archIntro,
          body: (
            <>
              <Figure caption="Reference design. Boxes show components; arrows show who calls whom.">
                <ArchSvg a={c.arch} uid={c.id + "-arch"} />
              </Figure>
              <dl className="notes">{c.archNotes.map(([t, d]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{d}</dd>])}</dl>
            </>
          ),
        },
        {
          key: "flow",
          title: INTERVIEW_DETAIL_COPY.sections["flow.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["flow.x"].prompt,
          intro: c.flowIntro,
          body: (
            <>
              <Figure caption="Solid arrows are requests; dashed arrows are responses.">
                <SeqSvg s={c.seq} uid={c.id + "-seq"} />
              </Figure>
              <ol className="flow-notes">{c.flowNotes.map((t) => <li key={t}>{t}</li>)}</ol>
            </>
          ),
        },
        ...(F
          ? [
              {
                key: "fe",
                title: INTERVIEW_DETAIL_COPY.sections["fe.x"].title,
                prompt: INTERVIEW_DETAIL_COPY.sections["fe.x"].prompt,
                intro: F.fe.intro,
                body: (
                  <>
                    <h3>Screen map</h3>
                    <Figure caption="Screens and how users move between them.">
                      <ArchSvg a={F.fe.screens} uid={c.id + "-fe"} />
                    </Figure>
                    <dl className="notes">{F.fe.screenNotes.map(([t, d]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{d}</dd>])}</dl>
                    <h3>Client layers</h3>
                    <Table head={["Layer", "Technology", "Responsibility"]} rows={F.fe.layers} />
                    <h3>Every state the user can see</h3>
                    <Table head={["State", "What the user sees", "How it works"]} rows={F.fe.uiStates} />
                    <h3>Code</h3>
                    {F.fe.code.map((k) => <Code key={k[0]} sample={k} />)}
                  </>
                ),
              },
            ]
          : []),
        {
          key: "api",
          title: INTERVIEW_DETAIL_COPY.sections["api.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["api.x"].prompt,
          intro: INTERVIEW_DETAIL_COPY.sections["api.x"].intro,
          body: <>{c.code.map((k) => <Code key={k[0]} sample={k} />)}</>,
        },
        ...(PAGE_CODE[`/interview/${c.id}`]
          ? [
              {
                key: "walk",
                title: INTERVIEW_DETAIL_COPY.sections["walk.x"].title,
                intro: INTERVIEW_DETAIL_COPY.sections["walk.x"].intro,
                body: <CodeWalks ids={PAGE_CODE[`/interview/${c.id}`]} />,
              },
            ]
          : []),
        {
          key: "deep",
          title: INTERVIEW_DETAIL_COPY.sections["deep.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["deep.x"].prompt,
          intro: INTERVIEW_DETAIL_COPY.sections["deep.x"].intro,
          body: (
            <>
              {c.deep.map(([h, ps]) => (
                <div key={h} className="deep-part">
                  <h3>{h}</h3>
                  {ps.map((p) => <p key={p}>{p}</p>)}
                </div>
              ))}
            </>
          ),
        },
      ],
    },
    {
      key: "qa",
      lead: INTERVIEW_DETAIL_COPY.parts.qa.lead,
      sections: [
        {
          key: "follow",
          title: INTERVIEW_DETAIL_COPY.sections["follow.x"].title,
          intro: INTERVIEW_DETAIL_COPY.sections["follow.x"].intro,
          body: <Faq items={c.followups} />,
        },
        ...(F
          ? [
              {
                key: "fe-follow",
                title: INTERVIEW_DETAIL_COPY.sections["follow.x"].title2,
                intro: INTERVIEW_DETAIL_COPY.sections["follow.x"].intro2,
                body: <Faq items={F.fe.followups} />,
              },
            ]
          : []),
        ...(crit.length
          ? [
              {
                key: "crit",
                title: INTERVIEW_DETAIL_COPY.sections["crit.x"].title,
                intro: INTERVIEW_DETAIL_COPY.sections["crit.x"].intro,
                body: (
                  <div className="crit">
                    {critGroups.map(([topic, items]) => (
                      <div key={topic} className="crit-group">
                        <h3>
                          {CRIT_TOPIC[topic] ?? topic} <span className="ct">{items.length}</span>
                        </h3>
                        {items.map(({ q, i }) => (
                          <CritItem key={i} caseId={c.id} index={i} q={q} />
                        ))}
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
      lead: INTERVIEW_DETAIL_COPY.parts.more.lead,
      sections: [
        {
          key: "trade",
          title: INTERVIEW_DETAIL_COPY.sections["trade.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["trade.x"].prompt,
          intro: INTERVIEW_DETAIL_COPY.sections["trade.x"].intro,
          body: <Table head={["Decision", "Chosen", "Rejected", "Why"]} rows={c.tradeoffs} />,
        },
        {
          key: "fail",
          title: INTERVIEW_DETAIL_COPY.sections["fail.x"].title,
          prompt: INTERVIEW_DETAIL_COPY.sections["fail.x"].prompt,
          intro: INTERVIEW_DETAIL_COPY.sections["fail.x"].intro,
          body: <Table head={["What breaks", "How the design copes"]} rows={c.failures} />,
        },
        ...(F
          ? [
              {
                key: "fe-quality",
                title: INTERVIEW_DETAIL_COPY.sections["fail.x"].title2,
                intro: INTERVIEW_DETAIL_COPY.sections["fail.x"].intro2,
                body: (
                  <div className="plat">
                    <div>
                      <h4>Performance</h4>
                      <ul>{F.fe.perf.map((t) => <li key={t}>{t}</li>)}</ul>
                    </div>
                    <div>
                      <h4>Accessibility and localisation</h4>
                      <ul>{F.fe.a11y.map((t) => <li key={t}>{t}</li>)}</ul>
                    </div>
                  </div>
                ),
              },
            ]
          : []),
        {
          key: "level",
          title: INTERVIEW_DETAIL_COPY.sections["level.x"].title,
          intro: INTERVIEW_DETAIL_COPY.sections["level.x"].intro,
          body: (
            <div className="lv">
              <div>
                <b className="lab">Senior answer</b>
                <p>{c.levels[0]}</p>
              </div>
              <div className="pr">
                <b className="lab">Principal answer</b>
                <p>{c.levels[1]}</p>
              </div>
            </div>
          ),
        },
        {
          key: "board",
          title: INTERVIEW_DETAIL_COPY.sections["board.x"].title,
          intro: INTERVIEW_DETAIL_COPY.sections["board.x"].intro,
          body: <ol className="draw">{c.draw.map((d) => <li key={d}>{d}</li>)}</ol>,
        },
      ],
    },
  ];
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const c = getCase((await params).id);
  if (!c) notFound();
  const next = CASES[(CASES.indexOf(c) + 1) % CASES.length];
  return (
    <main>
      <JsonLd data={articleLd({ title: c.title, description: c.prompt, path: `/interview/${c.id}`, section: "System design" })} />
      <div className="post-head">
        <div className="kicker">
          <Link href="/interview">Interview room</Link> · {c.track} system design · {c.minutes} minutes
        </div>
        <h1>{c.title}</h1>
        <AssetMeta href={`/interview/${c.id}`} />
        <PageTrail href={`/interview/${c.id}`} />
        <PathLink href={`/interview/${c.id}`} />
        <StudyWithAI />
      </div>
      <CaseRound id={c.id} title={c.title} minutes={c.minutes} parts={parts(c)} next={{ id: next.id, title: next.title }} />
      <PageEnd href={`/interview/${c.id}`} />
      <Footer>AI Engineer · interview room</Footer>
    </main>
  );
}
