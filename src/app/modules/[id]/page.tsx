import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, MODULES } from "@/content/modules";
import { CodeWalk, CodeWalks } from "@/components/CodeWalk";
import { FILE_DOC, PAGE_CODE } from "@/content/code-docs";
import { AssetMeta } from "@/components/AssetMeta";
import { PathLink } from "@/components/programme/PathLink";
import { Chapters, ConceptGrid, type ChapterPart, type ChapterSection } from "@/components/Chapters";
import { ArchSvg, Figure } from "@/components/Diagrams";
import { ModuleCard } from "@/components/ModuleShelf";
import { Reading } from "@/components/Reading";
import { Code, Faq, Footer, Table } from "@/components/ui";
import { assetByHref } from "@/lib/catalog";
import { moduleCode } from "@/lib/module-source";
import { DOMAIN_LABEL, FORMAT_LABEL } from "@/types/portal";

export const dynamicParams = false;
export const generateStaticParams = () => MODULES.map((m) => ({ id: m.assetId }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = getModule((await params).id);
  return m ? { title: m.title, description: m.commentary } : {};
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const m = getModule((await params).id);
  if (!m) notFound();
  const same = MODULES.filter((x) => x.domain === m.domain);
  const next = same[(same.indexOf(m) + 1) % same.length];
  const related = same.filter((x) => x.assetId !== m.assetId && x.curriculum === m.curriculum).slice(0, 3);

  const detail: ChapterSection[] = [];
  if (m.arch)
    detail.push({
      id: "arch",
      title: "Architecture",
      intro: "The components and how they connect.",
      body: (
        <Figure caption="Boxes are components; arrows show calls and data flow.">
          <ArchSvg a={m.arch} uid={m.assetId} />
        </Figure>
      ),
    });
  detail.push({
    id: "steps",
    title: "Step by step",
    intro: "The mechanism, in the order you would explain it.",
    body: (
      <ol className="step-list">
        {m.steps.map(([h, p]) => (
          <li key={h}>
            <b>{h}</b>
            <p>{p}</p>
          </li>
        ))}
      </ol>
    ),
  });
  if (m.table)
    detail.push({
      id: "table",
      title: m.table.title,
      intro: m.table.intro,
      body: <Table head={m.table.head} rows={m.table.rows} />,
    });
  if (m.code)
    detail.push({
      id: "code",
      title: "Code",
      intro: "Working code for the core of it.",
      body: (
        <>
          {m.code.map((c) =>
            FILE_DOC[c.file] ? (
              <CodeWalk key={c.file} id={FILE_DOC[c.file]} />
            ) : (
              <div key={c.file} className="mod-code">
                <Code sample={[c.title, c.lang, moduleCode(c.file)]} fileName={c.file} hideTitle />
                {c.note && <p className="note">{c.note}</p>}
              </div>
            )
          )}
        </>
      ),
    });

  const extra = PAGE_CODE[`/modules/${m.assetId}`];
  if (extra)
    detail.push({
      id: "walk",
      title: m.code ? "More tested code" : "Code",
      intro: "A working implementation, then what each part does and why.",
      body: <CodeWalks ids={extra} />,
    });

  const parts: ChapterPart[] = [
    {
      key: "basics",
      lead: "The whole idea first, then the terms the rest of this page uses.",
      sections: [
        {
          id: "epitome",
          title: "Whole idea",
          body: (
            <>
              <p className="lead">{m.epitome}</p>
              <div className="why-box">
                <b>Why it matters</b>
                <p>{m.commentary}</p>
              </div>
            </>
          ),
        },
        { id: "concepts", title: "Key concepts", intro: "One idea per card, in plain words.", body: <ConceptGrid items={m.concepts} /> },
      ],
    },
    {
      key: "question",
      lead: "What exactly you must answer, and what to settle before you start.",
      sections: [
        {
          id: "prompt",
          title: "Question",
          body: (
            <div className="ask">
              <span className="who">Interviewer</span>
              <p>{m.prompt}</p>
            </div>
          ),
        },
        ...(m.clarify ? [{ id: "clarify", title: "Clarify first", intro: "Each answer removes a guess.", body: <Table head={["You ask", "Answer"]} rows={m.clarify} /> }] : []),
      ],
    },
    { key: "detail", lead: "How it works, and how to build or explain it.", sections: detail },
    { key: "qa", lead: "What interviewers ask next. Answer out loud, then open.", sections: [{ id: "qa", title: "Interview questions", body: <Faq items={m.qa} /> }] },
    {
      key: "more",
      lead: "Edge cases, counterpoints and what to read next.",
      sections: [
        {
          id: "further",
          title: "Edge cases and counterpoints",
          intro: "Includes the strongest argument against this approach.",
          body: (
            <dl className="notes">
              {m.further.map(([t, d]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{d}</dd>])}
            </dl>
          ),
        },
        ...(related.length
          ? [
              {
                id: "related",
                title: "Read next",
                body: (
                  <div className="mod-grid tight">
                    {related.map((r) => (
                      <ModuleCard key={r.assetId} m={r} />
                    ))}
                  </div>
                ),
              },
            ]
          : []),
      ],
    },
  ];

  const asset = assetByHref(`/modules/${m.assetId}`);

  return (
    <main>
      <div className="post-head">
        <div className="kicker">
          <Link href="/modules">Modules</Link> · {DOMAIN_LABEL[m.domain]} · {FORMAT_LABEL[m.format]}
        </div>
        <h1>{m.title}</h1>
        <AssetMeta asset={asset} outcome={m.outcome} />
        <PathLink href={`/modules/${m.assetId}`} />
      </div>
      <Reading title={m.title} kind="Module" articleId="deep-article">
        <Chapters parts={parts} prefix="md" />
        <div className="next">
          <div>
            <div className="kicker">Next in {DOMAIN_LABEL[m.domain]}</div>
            <b>{next.title}</b>
          </div>
          <div className="btns">
            <Link className="btn ghost" href="/modules">
              All modules
            </Link>
            <Link className="btn" href={`/modules/${next.assetId}`}>
              Next →
            </Link>
          </div>
        </div>
      </Reading>
      <Footer>AI Engineer · {m.title}</Footer>
    </main>
  );
}
