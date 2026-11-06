import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CASES, DEEP, getDeep } from "@/lib/content";
import { ArchSvg, Figure, SeqSvg } from "@/components/Diagrams";
import { Code, Faq, Footer, Table } from "@/components/ui";
import { Chapters, ConceptGrid, QuestionList, type ChapterPart, type ChapterSection } from "@/components/Chapters";
import { GLOSSARY } from "@/lib/curriculum";
import { Reading } from "@/components/Reading";
import { CodeWalks } from "@/components/CodeWalk";
import { PAGE_CODE } from "@/content/code-docs";
import { AssetMeta } from "@/components/AssetMeta";
import { PathLink } from "@/components/programme/PathLink";

export const dynamicParams = false;
export const generateStaticParams = () => DEEP.map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = getDeep((await params).id);
  return d ? { title: d.title, description: d.summary } : {};
}

export default async function DeepPage({ params }: { params: Promise<{ id: string }> }) {
  const d = getDeep((await params).id);
  if (!d) notFound();
  const L = {
    does: "Its job", doesnt: "Not its job", scenario: "Real-life run", arch: "Anatomy", states: "States", seq: "Run loop", code: "Code",
    platforms: "Platforms", tech: "Technology choices", real: "How real products do it", metrics: "Metrics to emit",
    edges: "Edge cases", interview: "Interview questions",
    ...(d.labels as Record<string, string> | undefined),
  };
  const same = DEEP.filter((x) => x.group === d.group);
  const rounds = CASES.filter((c) => (d.group === "ai") === (c.track === "AI"));
  const statesAreTerms = !!d.states && /term/i.test(L.states);
  const text = JSON.stringify(d).toLowerCase();
  const stateNames = new Set((d.states ?? []).map(([t]) => t.toLowerCase()));
  const glossary = GLOSSARY.filter(([t]) => !stateNames.has(t.toLowerCase()) && new RegExp(`\\b${t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)).slice(0, 6);
  const sec = (id: string, title: string, body: ReactNode, intro?: string): ChapterSection => ({ id, title, body, intro });

  const parts: ChapterPart[] = [
    {
      key: "basics",
      lead: "What this part of the system is, what it is responsible for, and the vocabulary you need before the mechanics.",
      sections: [
        sec(
          "ov",
          "Definition",
          <>
            <p className="lead">{d.summary}</p>
            <div className="dd2">
              <div>
                <b className="lab">{L.does}</b>
                <ul>{d.does.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <b className="lab">{L.doesnt}</b>
                <ul>{d.doesnt.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
          </>,
          "The one-paragraph summary, then where its responsibility starts and stops."
        ),
        ...(statesAreTerms ? [sec("st", L.states, <Table head={["Term", "Meaning"]} rows={d.states!} />, "The words used in the rest of this page.")] : []),
        ...(glossary.length >= 2 ? [sec("kc", "Key concepts", <ConceptGrid items={glossary} />, "Ideas this deep dive relies on, in one sentence each.")] : []),
        ...(d.scenario ? [sec("sc", L.scenario, <div className="story">{d.scenario.map((p) => <p key={p}>{p}</p>)}</div>, "A concrete example first, so the mechanics have something to attach to.")] : []),
      ],
    },
    {
      key: "question",
      lead: "Know what you are reading for. These are the questions this deep dive prepares you to answer, and the rounds where they come up.",
      sections: [
        ...(d.interview?.length
          ? [sec("qs", "Target questions", <QuestionList items={d.interview.map(([q]) => q)} note="Model answers are in part 4, after the detail that supports them." />, "Keep them in mind while you read the detail.")]
          : []),
        sec(
          "rd",
          "Interview rounds",
          <div className="golinks">
            {rounds.map((c) => (
              <Link key={c.id} href={`/interview/${c.id}`}>
                {c.title}
              </Link>
            ))}
          </div>,
          "System design rounds where this component is part of a strong answer."
        ),
      ],
    },
    {
      key: "detail",
      lead: "How it actually works: the components, the states it moves through, a full run, and the code.",
      sections: [
        ...(d.arch
          ? [
              sec(
                "ar",
                L.arch,
                <>
                  <Figure caption="Boxes are components; arrows show calls and data flow.">
                    <ArchSvg a={d.arch} uid={d.id + "a"} />
                  </Figure>
                  <dl className="notes">{d.archNotes.map(([t, x]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{x}</dd>])}</dl>
                </>,
                "The parts and how they connect."
              ),
            ]
          : []),
        ...(d.states && !statesAreTerms ? [sec("st", L.states, <Table head={[d.group === "ai" ? "Name" : "State", "Meaning"]} rows={d.states} />)] : []),
        ...(d.seq
          ? [
              sec(
                "sq",
                L.seq,
                <>
                  <Figure caption="Solid arrows are calls; dashed arrows are responses.">
                    <SeqSvg s={d.seq} uid={d.id + "s"} />
                  </Figure>
                  <ol className="flow-notes">{d.seqNotes.map((t) => <li key={t}>{t}</li>)}</ol>
                </>,
                "One run, step by step."
              ),
            ]
          : []),
        ...(d.code ? [sec("cd", L.code, <>{d.code.map((k) => <Code key={k[0]} sample={k} />)}</>, "Working code for the core of it.")] : []),
        ...(PAGE_CODE[`/deep/${d.id}`] ? [sec("cw", "Tested code, explained", <CodeWalks ids={PAGE_CODE[`/deep/${d.id}`]} />, "A working implementation, then what each part does and why.")] : []),
        ...(d.platforms
          ? [
              sec(
                "pl",
                L.platforms,
                <div className="plat">
                  {d.platforms.map(([h, items]) => (
                    <div key={h}>
                      <h4>{h}</h4>
                      <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                  ))}
                </div>
              ),
            ]
          : []),
      ],
    },
    {
      key: "qa",
      lead: "The questions from part 2, now with model answers. Try each one out loud before opening it.",
      sections: d.interview?.length ? [sec("iq", L.interview, <Faq items={d.interview} />)] : [],
    },
    {
      key: "more",
      lead: "Practical context for real projects: which technology to pick, what successful teams do, what to measure and the edge cases to plan for.",
      sections: [
        ...(d.tech ? [sec("tc", L.tech, <Table head={["Need", "Options", "When to pick"]} rows={d.tech} />)] : []),
        ...(d.real && d.real.length
          ? [
              sec(
                "rl",
                L.real,
                <>
                  <p className="note">Summaries of what these teams and projects have described publicly. Check their own write-ups for detail.</p>
                  <Table head={["Who", "What they describe"]} rows={d.real} />
                </>
              ),
            ]
          : []),
        ...(d.metrics ? [sec("mt", L.metrics, <Table head={["Metric", "Why it matters"]} rows={d.metrics} />)] : []),
        ...(d.edges ? [sec("ed", L.edges, <Table head={["Case", "How it is handled"]} rows={d.edges} />)] : []),
      ],
    },
  ];

  const next = same[(same.indexOf(d) + 1) % same.length];

  return (
    <main>
      <div className="post-head">
        <div className="kicker">
          <Link href="/deep">Deep dives</Link> · {d.kicker}
        </div>
        <h1>{d.title}</h1>
        <AssetMeta href={`/deep/${d.id}`} />
        <PathLink href={`/deep/${d.id}`} />
      </div>
      <Reading title={d.title} kind="Deep dive" articleId="deep-article">
        <Chapters parts={parts} prefix="dd" />
        <div className="next">
          <div>
            <div className="kicker">Next deep dive</div>
            <b>{next.title}</b>
          </div>
          <div className="btns">
            <Link className="btn ghost" href="/deep">
              All deep dives
            </Link>
            <Link className="btn" href={`/deep/${next.id}`}>
              Next →
            </Link>
          </div>
        </div>
      </Reading>
      <Footer>AI Engineer · {d.title}</Footer>
    </main>
  );
}
