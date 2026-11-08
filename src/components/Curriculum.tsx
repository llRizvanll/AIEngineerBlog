"use client";

import Link from "next/link";
import { useState } from "react";
import type { Phase } from "@/lib/curriculum";
import { AI_BASICS_HREF, AI_PATHS_HREF, dayHref, PROGRAMME_HREF } from "@/lib/routes";
import { emptyInterview, emptyLibrary, emptyProgramme, INTERVIEW_KEY, LIBRARY_KEY, PROGRAMME_KEY, useLocal, type InterviewState, type LibraryState, type ProgrammeState } from "@/lib/store";

interface Props {
  phases: Phase[];
  paths: { title: string; blurb: string; items: { href: string; title: string; why: string }[] }[];
  programme: { days: { n: number; stop: string }[]; blurb: string };
  glossary: [string, string][];
  caseIds: string[];
  totalCrit: number;
}

export function Curriculum({ phases, paths, programme, glossary, caseIds, totalCrit }: Props) {
  const [q, setQ] = useState("");
  const [lib] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  const [iv] = useLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
  const [prog] = useLocal<ProgrammeState>(PROGRAMME_KEY, emptyProgramme);
  const seen = (h: string) => !!lib.seen[h];
  const ql = q.toLowerCase();
  const uniq = Array.from(new Set(phases.flatMap((p) => p.lessons.map((l) => l.href))));
  const done = caseIds.filter((id) => iv.done[id]).length;
  const got = Object.values(iv.crit).filter(Boolean).length;
  const gl = glossary.filter(([t, d]) => !ql || (t + " " + d).toLowerCase().includes(ql));

  return (
    <div className="wrap">
      <section className="iv-hero">
        <div className="kicker">AIEngine</div>
        <h1>
          Everything, in one <span className="serif grad-text">place.</span>
        </h1>
        <p>
          One curriculum for the principal engineer loop with AI: {phases.length} phases that pull together the posts, interview rounds, deep
          dives, reels and revision cards. Follow the phases in order or pick a path.
        </p>
        <div className="btns">
          <Link className="btn" href={PROGRAMME_HREF}>
            Start the two-week programme →
          </Link>
          <Link className="btn ghost" href="/revise">
            Revise
          </Link>
        </div>
      </section>
      <div className="aie-stats stagger">
        <div>
          <b>
            {uniq.filter(seen).length}/{uniq.length}
          </b>
          <span>lessons opened</span>
        </div>
        <div>
          <b>
            {done}/{caseIds.length}
          </b>
          <span>rounds practised</span>
        </div>
        <div>
          <b>
            {got}/{totalCrit}
          </b>
          <span>critical Q&amp;A answered</span>
        </div>
        <div>
          <b>{glossary.length}</b>
          <span>glossary terms</span>
        </div>
      </div>

      <div className="section-h">
        <h2>Learning paths</h2>
        <span>each step says why it comes next</span>
      </div>
      <div className="aie-paths stagger">
        <div className="aie-feature">
          <h3>Crack AI interviews</h3>
          <p>Four connected paths: AI interview hacks, every new round, a study plan with a final stretch with AI off, and a mock interviewer you build yourself. Plus critical basics to memorise.</p>
          <p>
            React Native too: <Link href="/paths/react-native">every React Native page in one place</Link>.
          </p>
          <div className="btns">
            <Link className="btn" href={AI_PATHS_HREF}>
              Open the paths →
            </Link>
            <Link className="btn ghost" href={AI_BASICS_HREF}>
              Critical basics
            </Link>
          </div>
        </div>
        <div className="aie-feature">
          <h3>Mobile principal in two weeks</h3>
          <p>{programme.blurb}</p>
          <ol className="aie-stops">
            {programme.days.map((d) => (
              <li key={d.n} className={prog.done[d.n] ? "done" : ""}>
                <Link href={dayHref(d.n)}>
                  <b>{prog.done[d.n] ? "✓" : d.n}</b> {d.stop}
                </Link>
              </li>
            ))}
          </ol>
          <Link className="btn" href={PROGRAMME_HREF}>
            Open the programme →
          </Link>
        </div>
        {paths.map((p) => (
          <div className="aie-path" key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.blurb}</p>
            <ol>
              {p.items.map((it) => (
                <li key={it.href}>
                  <Link href={it.href}>{it.title}</Link>
                  {seen(it.href) ? " ✓" : ""}
                  <small>{it.why}</small>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="section-h">
        <h2>Curriculum</h2>
        <input id="aie-q" type="search" placeholder="Search lessons and terms" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="aie-cur">
        {phases.map((p) => {
          const its = p.lessons.filter((i) => !ql || `${i.title} ${p.title} ${i.kind}`.toLowerCase().includes(ql));
          if (!its.length) return null;
          return (
            <details className="aie-ph" key={p.num + (ql ? "q" : "")} open={!!ql || p.num === "00"}>
              <summary>
                <span className="n">{p.num}</span>
                <span className="tx">
                  <b>{p.title}</b>
                  <small>{p.blurb}</small>
                </span>
                <span className="st">
                  {p.lessons.filter((l) => seen(l.href)).length}/{p.lessons.length}
                </span>
              </summary>
              <div className="aie-its">
                {its.map((i) => (
                  <Link key={i.href} className={"aie-it" + (seen(i.href) ? " seen" : "")} href={i.href}>
                    <span className="k">{i.kind}</span>
                    <span className="t">{i.title}</span>
                    <span className="m">
                      {i.meta}
                      {seen(i.href) ? " ✓" : ""}
                    </span>
                  </Link>
                ))}
              </div>
            </details>
          );
        })}
      </div>

      <div className="section-h" id="glossary">
        <h2>Glossary</h2>
        <span>{gl.length} terms</span>
      </div>
      <dl className="aie-gl">
        {gl.length ? (
          gl.map(([t, d]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))
        ) : (
          <p>No terms match.</p>
        )}
      </dl>

      <div className="section-h">
        <h2>How each lesson works</h2>
        <span>the loop</span>
      </div>
      <div className="kit">
        <div>
          <b>Read</b>
          <p>The problem, the analogy and the mechanism, in plain words.</p>
        </div>
        <div>
          <b>Draw</b>
          <p>Diagrams for architecture and flow that you can redraw from memory.</p>
        </div>
        <div>
          <b>Answer</b>
          <p>Practice mode: write your answer, then compare with the model one.</p>
        </div>
        <div>
          <b>Revise</b>
          <p>Critical incident questions and flashcards, tracked in this browser.</p>
        </div>
      </div>
    </div>
  );
}
