import Link from "next/link";
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
import { kotlinLines, kotlinSource } from "@/lib/mobile-source";

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
  const style = { "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties;
  const related = p.related.map((r) => MOBILE_PROBLEMS.find((x) => x.id === r)).filter((x): x is (typeof MOBILE_PROBLEMS)[number] => !!x);

  const parts: ChapterPart[] = [
    {
      key: "basics",
      lead: "The concepts this component is built on. With these in mind, every line of the solution has a reason.",
      sections: [
        { id: "concepts", title: "Key concepts", intro: "One idea per card, in the order the solution uses them.", body: <ConceptGrid items={MOBILE_CONCEPTS[p.id] ?? []} /> },
      ],
    },
    {
      key: "question",
      lead: "What exactly you are asked to build, what must be true when you are done, and what to ask before you start.",
      sections: [
        {
          id: "prompt",
          title: "Prompt",
          intro: "The question as the interviewer asks it, and the requirements to check your solution against.",
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
        { id: "clarify", title: "Clarify first", intro: "Questions worth asking, and the answers this interviewer gives.", body: <Table head={["You ask", "Interviewer answers"]} rows={p.clarify} /> },
      ],
    },
    {
      key: "detail",
      lead: "The design decisions, the complete Kotlin solution, and a walk through it one block at a time.",
      sections: [
        {
          id: "design",
          title: "Design decisions",
          intro: "Settle these before writing code; each one shows up in the solution.",
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
          title: "Solution",
          intro: "Complete, compiling Kotlin with coroutines, built with warnings as errors and covered by tests/mobile/MobileTests.kt.",
          body: <Code sample={[p.title, "kotlin", source]} fileName={`${p.file}.kt`} hideTitle />,
        },
        {
          id: "walk",
          title: "Line-by-line walkthrough",
          intro: "The same code in the order you would explain it in the room.",
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
      lead: "The questions interviewers ask after the code works. Answer out loud, then open.",
      sections: [{ id: "follow", title: "Follow-up questions", body: <Faq items={p.followups} /> }],
    },
    {
      key: "more",
      lead: "The cases that break naive solutions, how the same design looks on iOS, and what to practise next.",
      sections: [
        {
          id: "edges",
          title: "Edge cases",
          intro: "Say these before the interviewer does.",
          body: (
            <ul className="traps">
              {p.edgeCases.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ),
        },
        { id: "ios", title: "On iOS", intro: "The same design in Swift and Apple's frameworks.", body: <Table head={["Approach", "Swift / iOS"]} rows={p.ios} /> },
        ...(related.length
          ? [
              {
                id: "related",
                title: "Practise next",
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
      <div className="pat-hero">
        <div className="kicker">
          <Link href="/mobile-coding">Mobile machine coding</Link> · {String(i + 1).padStart(2, "0")} of {MOBILE_PROBLEMS.length}
        </div>
        <h1>{p.title}</h1>
        <p className="dek">{p.tagline}</p>
        <AssetMeta href={`/mobile-coding/${p.id}`} />
        <PathLink href={`/mobile-coding/${p.id}`} />
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
      <Footer>AI Engineer · {p.title}</Footer>
    </main>
  );
}
