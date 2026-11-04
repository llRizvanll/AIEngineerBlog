import type { ReactNode } from "react";

/* Every detail page follows the same five parts, in this order:
   basics → the question → the answer in detail → Q&A → going further. */

export type PartKey = "basics" | "question" | "detail" | "qa" | "more";

export const PART_TITLES: Record<PartKey, string> = {
  basics: "The basics",
  question: "The question",
  detail: "The answer in detail",
  qa: "Questions and answers",
  more: "Going further",
};

export interface ChapterSection {
  id: string;
  title: string;
  /** one sentence saying what this section gives the reader */
  intro?: string;
  body: ReactNode;
}

export interface ChapterPart {
  key: PartKey;
  lead: string;
  sections: ChapterSection[];
}

/** Drops empty parts so numbering stays continuous. */
export const visibleParts = <T extends { sections: unknown[] }>(parts: T[]) => parts.filter((p) => p.sections.length > 0);

export function Roadmap({ parts }: { parts: { key: PartKey; sections: { title: string }[] }[] }) {
  return (
    <nav className="roadmap" aria-label="How this page is organised">
      <span className="rm-h">How this page is organised</span>
      <ol>
        {parts.map((p, i) => (
          <li key={p.key} className={`rm-${p.key}`}>
            <a href={`#part-${p.key}`}>
              <span className="rm-n">{i + 1}</span>
              <span className="rm-t">{PART_TITLES[p.key]}</span>
              <span className="rm-s">{p.sections.map((s) => s.title).join(" · ")}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PartHead({ part, n, total, lead }: { part: PartKey; n: number; total: number; lead: string }) {
  return (
    <div className={`part part-${part}`} id={`part-${part}`} data-part-head={`${n}. ${PART_TITLES[part]}`}>
      <span className="part-n">
        Part {n} of {total}
      </span>
      <h2 className="part-t">{PART_TITLES[part]}</h2>
      <p className="part-lead">{lead}</p>
    </div>
  );
}

export function SectionHead({ num, title, intro }: { num: string; title: string; intro?: string }) {
  return (
    <>
      <h2>
        <span className="n">{num}</span>
        {title}
      </h2>
      {intro && <p className="sec-intro">{intro}</p>}
    </>
  );
}

/** Renders the roadmap, then each part header followed by its numbered sections (1.1, 1.2, 2.1…). */
export function Chapters({ parts, prefix }: { parts: ChapterPart[]; prefix: string }) {
  const shown = visibleParts(parts);
  return (
    <>
      <Roadmap parts={shown} />
      {shown.flatMap((p, pi) => [
        <PartHead key={`part-${p.key}`} part={p.key} n={pi + 1} total={shown.length} lead={p.lead} />,
        ...p.sections.map((s, si) => (
          <section key={s.id} id={`${prefix}-${s.id}`} data-toc={s.title} className={`in-${p.key}`}>
            <SectionHead num={`${pi + 1}.${si + 1}`} title={s.title} intro={s.intro} />
            {s.body}
          </section>
        )),
      ])}
    </>
  );
}

/** A grid of term → plain-language meaning cards. */
export function ConceptGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="concepts">
      {items.map(([t, d], i) => (
        <div key={t} className="concept">
          <span className="cn">{String(i + 1).padStart(2, "0")}</span>
          <b>{t}</b>
          <p>{d}</p>
        </div>
      ))}
    </div>
  );
}

/** Numbered list of the questions a page answers; the answers come later. */
export function QuestionList({ items, note }: { items: string[]; note?: string }) {
  return (
    <>
      <ol className="qlist">
        {items.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
      {note && <p className="note">{note}</p>}
    </>
  );
}
