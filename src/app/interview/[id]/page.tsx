import { PageTrail } from "@/components/PageTrail";
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

export const dynamicParams = false;
export const generateStaticParams = () => CASES.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = getCase((await params).id);
  return c ? { title: c.title, description: c.prompt } : {};
}

/** How a 45-minute round is usually split; the timer uses the same shares. */
const TIME_PLAN: [string, number, string][] = [
  ["Clarify", 0.1, "Ask questions, agree on scope and write down assumptions."],
  ["Estimate", 0.1, "Rough numbers for users, data and traffic, and what they imply."],
  ["High-level design", 0.25, "Components, data flow and the key API on the board."],
  ["Deep dive", 0.35, "The two or three hardest parts, with real mechanisms."],
  ["Trade-offs and wrap-up", 0.2, "Decisions, failure modes, and what you would do next."],
];

const CRIT_TOPIC: Record<string, string> = {
  simple: "The product",
  clarify: "Requirements",
  estimate: "Scale",
  arch: "Architecture",
  flow: "The key flow",
  fe: "Front end",
  api: "Data and APIs",
  deep: "The hard parts",
  trade: "Trade-offs",
  fail: "Failures",
  follow: "Follow-ups",
  level: "Seniority",
};

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
      lead: "Start with the product and the ideas it depends on. If these are clear, the design that follows will feel obvious rather than memorised.",
      sections: [
        {
          key: "simple",
          title: "Product in plain words",
          intro: "Who uses it, what a normal day looks like, and why it is harder than it seems.",
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
          title: "Key concepts",
          intro: "The building blocks this design uses. Each one appears again in the answer.",
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
      lead: "Now read the question closely. Agree on what you are building, ask what is unclear, and work out the numbers before you draw anything.",
      sections: [
        {
          key: "brief",
          title: "Brief and scope",
          intro: "The question exactly as the interviewer asks it, and what they want to learn from your answer.",
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
          title: "Clarify the problem",
          prompt: "Before drawing anything, list the questions you would ask the interviewer.",
          intro: "The first five minutes. Each answer removes a guess from your design.",
          body: <Table head={["You ask", "Interviewer answers"]} rows={c.clarify} />,
        },
        {
          key: "estimate",
          title: "Estimate the scale",
          prompt: "Write down the numbers that will drive the design.",
          intro: "Say the arithmetic out loud. What matters is the order of magnitude and what it forces you to do.",
          body: <Table head={["Metric", "Estimate", "How"]} rows={c.numbers} />,
        },
      ],
    },
    {
      key: "detail",
      lead: "The design itself, from the big picture down to the code: components first, then one request end to end, then the parts interviewers push hardest on.",
      sections: [
        {
          key: "arch",
          title: "Architecture",
          prompt: "Sketch the components and arrows, then compare.",
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
          title: "Key flow, step by step",
          prompt: "Narrate one request end to end.",
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
                title: "Front end",
                prompt: "Sketch the screens, the client layers and every UI state the user can see.",
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
          title: "Data model and APIs",
          prompt: "Write the schema or contract you would put on the board.",
          intro: "The tables and contracts that make the design concrete.",
          body: <>{c.code.map((k) => <Code key={k[0]} sample={k} />)}</>,
        },
        ...(PAGE_CODE[`/interview/${c.id}`]
          ? [
              {
                key: "walk",
                title: "Tested code, explained",
                intro: "The core of this design as working code, with what each part does and why.",
                body: <CodeWalks ids={PAGE_CODE[`/interview/${c.id}`]} />,
              },
            ]
          : []),
        {
          key: "deep",
          title: "Hard parts, in depth",
          prompt: "Pick two areas the interviewer will push on and explain them.",
          intro: "Where interviewers spend the second half of the round.",
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
      lead: "The questions that come after the design, with model answers. Answer each one out loud before opening it.",
      sections: [
        {
          key: "follow",
          title: "Follow-up questions",
          intro: "What the interviewer asks once the main design is on the board.",
          body: <Faq items={c.followups} />,
        },
        ...(F
          ? [
              {
                key: "fe-follow",
                title: "Front-end follow-ups",
                intro: "Questions aimed at the client: rendering, state and devices.",
                body: <Faq items={F.fe.followups} />,
              },
            ]
          : []),
        ...(crit.length
          ? [
              {
                key: "crit",
                title: "Incidents, probes and traps",
                intro: "Realistic production incidents and pointed probes, grouped by topic.",
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
      lead: "What turns a good answer into a strong one: the decisions you rejected, how the system fails, and the signals of seniority.",
      sections: [
        {
          key: "trade",
          title: "Trade-offs and decisions",
          prompt: "State each decision, the alternative you rejected and why.",
          intro: "Every choice has a cost. Naming it is what interviewers listen for.",
          body: <Table head={["Decision", "Chosen", "Rejected", "Why"]} rows={c.tradeoffs} />,
        },
        {
          key: "fail",
          title: "Failure modes",
          prompt: "List what breaks and how the system degrades.",
          intro: "What breaks in production, and how the design keeps working when it does.",
          body: <Table head={["What breaks", "How the design copes"]} rows={c.failures} />,
        },
        ...(F
          ? [
              {
                key: "fe-quality",
                title: "Performance and accessibility",
                intro: "The client-side details that separate a demo from a product.",
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
          title: "Senior versus principal",
          intro: "The same design, answered at two levels. Use the rubric to score yourself.",
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
          title: "Whiteboard",
          intro: "Draw the design here, in this order. It stays in this browser.",
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
      <Footer>AI Engineer · interview room</Footer>
    </main>
  );
}
