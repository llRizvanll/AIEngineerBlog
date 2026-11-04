import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CASES, CRITICAL, DEEP, FRONTEND, getCase } from "@/lib/content";
import { ArchSvg, Figure, SeqSvg } from "@/components/Diagrams";
import { Code, Faq, Footer, Table } from "@/components/ui";
import { CaseRound, type RoundSection } from "@/components/interview/CaseRound";
import type { InterviewCase } from "@/content/types";

export const dynamicParams = false;
export const generateStaticParams = () => CASES.map((c) => ({ id: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = getCase((await params).id);
  return c ? { title: c.title, description: c.prompt } : {};
}

const SECTIONS: [string, string, string][] = [
  ["simple", "The use case, explained simply", "Before designing, explain this product in plain words: who uses it, what they do, and why it is hard."],
  ["clarify", "Clarify the problem", "Before drawing anything, list the questions you would ask the interviewer."],
  ["estimate", "Estimate the scale", "Write down the numbers that will drive the design."],
  ["arch", "Draw the architecture", "Sketch the components and arrows on the whiteboard below, then compare."],
  ["flow", "Walk through the key flow", "Narrate one request end to end, step by step."],
  ["fe", "Front-end design", "Sketch the screens, the client layers and every UI state the user can see."],
  ["api", "Data model and APIs", "Write the schema or contract you would put on the board."],
  ["deep", "Deep dives", "Pick two areas the interviewer will push on and explain them in depth."],
  ["trade", "Trade-offs and decisions", "State each decision, the alternative you rejected and why."],
  ["fail", "Failure modes", "List what breaks and how the system degrades."],
  ["follow", "Follow-up questions", "Answer each follow-up out loud before opening it."],
  ["level", "What makes it principal-level", "How would you rate your answer?"],
  ["board", "Your whiteboard", "Draw the design here. It stays in this browser."],
];

function body(c: InterviewCase, key: string): ReactNode {
  const F = FRONTEND[c.id];
  switch (key) {
    case "simple": {
      if (!F) return <p>Coming soon.</p>;
      const x = F.simple;
      return (
        <>
          <p className="lead">{x.what}</p>
          <h3>Who uses it</h3>
          <ul className="who">{x.who.map((w) => <li key={w}>{w}</li>)}</ul>
          <h3>A day in the life</h3>
          <ol className="journey">{x.journey.map((j) => <li key={j}>{j}</li>)}</ol>
          <h3>Why it is hard</h3>
          <div className="hard">
            {x.hard.map(([h, p]) => (
              <div key={h}>
                <b>{h}</b>
                <p>{p}</p>
              </div>
            ))}
          </div>
          <div className="analogy">
            <b>Think of it like this</b>
            <p>{x.analogy}</p>
          </div>
          <p className="oneline">
            <b>The design in one sentence.</b> {x.oneLine}
          </p>
        </>
      );
    }
    case "clarify":
      return (
        <>
          <p>Good candidates spend the first five minutes here. These are the questions to ask and the answers this interviewer gives.</p>
          <Table head={["You ask", "Interviewer answers"]} rows={c.clarify} />
        </>
      );
    case "estimate":
      return (
        <>
          <p>Say the arithmetic out loud. The point is the order of magnitude and what it implies.</p>
          <Table head={["Metric", "Estimate", "How"]} rows={c.numbers} />
        </>
      );
    case "arch": {
      const rel = DEEP.filter((d) => (d.group === "ai") === (c.track === "AI"));
      return (
        <>
          <p>{c.archIntro}</p>
          <Figure caption="Reference design. Boxes show components; arrows show who calls whom.">
            <ArchSvg a={c.arch} uid={c.id + "-arch"} />
          </Figure>
          <dl className="notes">
            {c.archNotes.map(([t, d]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{d}</dd>])}
          </dl>
          <p className="go-h">Go one level deeper:</p>
          <div className="golinks">
            {rel.map((d) => (
              <Link key={d.id} href={`/deep/${d.id}`}>
                {d.title}
              </Link>
            ))}
          </div>
        </>
      );
    }
    case "flow":
      return (
        <>
          <p>{c.flowIntro}</p>
          <Figure caption="Solid arrows are requests; dashed arrows are responses.">
            <SeqSvg s={c.seq} uid={c.id + "-seq"} />
          </Figure>
          <ol className="flow-notes">{c.flowNotes.map((t) => <li key={t}>{t}</li>)}</ol>
        </>
      );
    case "fe": {
      if (!F) return <p>Coming soon.</p>;
      const x = F.fe;
      return (
        <>
          <p>{x.intro}</p>
          <h3>Screen map</h3>
          <Figure caption="Screens and how users move between them.">
            <ArchSvg a={x.screens} uid={c.id + "-fe"} />
          </Figure>
          <dl className="notes">{x.screenNotes.map(([t, d]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{d}</dd>])}</dl>
          <h3>Client layers</h3>
          <Table head={["Layer", "Technology", "Responsibility"]} rows={x.layers} />
          <h3>Every state the user can see</h3>
          <Table head={["State", "What the user sees", "How it works"]} rows={x.uiStates} />
          {x.code.map((k) => <Code key={k[0]} sample={k} />)}
          <div className="plat">
            <div>
              <h4>Performance</h4>
              <ul>{x.perf.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div>
              <h4>Accessibility and localisation</h4>
              <ul>{x.a11y.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
          <h3>Front-end follow-ups</h3>
          <Faq items={x.followups} />
          <p className="go-h">Go deeper:</p>
          <div className="golinks">
            <Link href="/deep/frontend-arch">Front-end architecture for offline, real-time and AI apps</Link>
          </div>
        </>
      );
    }
    case "api":
      return <>{c.code.map((k) => <Code key={k[0]} sample={k} />)}</>;
    case "deep":
      return (
        <>
          {c.deep.map(([h, ps]) => (
            <div key={h}>
              <h3>{h}</h3>
              {ps.map((p) => <p key={p}>{p}</p>)}
            </div>
          ))}
        </>
      );
    case "trade":
      return <Table head={["Decision", "Chosen", "Rejected", "Why"]} rows={c.tradeoffs} />;
    case "fail":
      return <Table head={["What breaks", "How the design copes"]} rows={c.failures} />;
    case "follow":
      return <Faq items={c.followups} />;
    case "level":
      return (
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
      );
    case "board":
      return (
        <>
          <p>Draw these, in this order:</p>
          <ol className="draw">{c.draw.map((d) => <li key={d}>{d}</li>)}</ol>
        </>
      );
  }
  return null;
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const c = getCase((await params).id);
  if (!c) notFound();
  const next = CASES[(CASES.indexOf(c) + 1) % CASES.length];
  const crit = CRITICAL[c.id] || [];
  const sections: RoundSection[] = SECTIONS.map(([key, title, prompt]) => ({
    key,
    title,
    prompt,
    body: body(c, key),
    crit: crit.map((q, i) => ({ q, i })).filter((x) => x.q[0] === key),
  }));
  return (
    <main>
      <div className="post-head">
        <div className="kicker">
          <Link href="/interview">Interview room</Link> · {c.track} system design · {c.minutes} minutes
        </div>
        <h1>{c.title}</h1>
        <div className="ask">
          <span className="who">Interviewer</span>
          <p>{c.prompt}</p>
        </div>
        <p className="testing">
          <b>Why panels ask this:</b> {c.why}
        </p>
      </div>
      <CaseRound id={c.id} title={c.title} minutes={c.minutes} sections={sections} next={{ id: next.id, title: next.title }} />
      <Footer>AI Engineer · interview room</Footer>
    </main>
  );
}
