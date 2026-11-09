"use client";

import { toneClass } from "@/config/tones";
import Link from "next/link";
import { useState } from "react";
import type { Phase } from "@/lib/curriculum";
import { Book, Title } from "./HubCards";
import { dayHref } from "@/lib/routes";
import { emptyInterview, emptyLibrary, emptyProgramme, INTERVIEW_KEY, LIBRARY_KEY, PROGRAMME_KEY, useLocal, type InterviewState, type LibraryState, type ProgrammeState } from "@/lib/store";
import { CURRICULUM_ICONS, AI_BASICS_HREF, AI_PATHS_HREF, PROGRAMME_HREF } from "@/config/constants";
import { CURRICULUM_COPY } from "@/content/ui-copy";

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
        <div className="kicker">{CURRICULUM_COPY.kicker}</div>
        <h1>
          Everything, in one <span className="serif grad-text">place.</span>
        </h1>
        <p>
          One curriculum for the principal engineer loop with AI: {phases.length} phases that pull together the posts, interview rounds, deep
          dives, reels and revision cards. Follow the phases in order or pick a path.
        </p>
        <div className="btns">
          <Link className="btn" href={PROGRAMME_HREF}>
            {CURRICULUM_COPY.start}
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
          <span>{CURRICULUM_COPY.lessonsOpened}</span>
        </div>
        <div>
          <b>
            {done}/{caseIds.length}
          </b>
          <span>{CURRICULUM_COPY.roundsPractised}</span>
        </div>
        <div>
          <b>
            {got}/{totalCrit}
          </b>
          <span>{CURRICULUM_COPY.qaAnswered}</span>
        </div>
        <div>
          <b>{glossary.length}</b>
          <span>{CURRICULUM_COPY.terms}</span>
        </div>
      </div>

      <div className="section-h">
        <h2>{CURRICULUM_COPY.pathsTitle}</h2>
        <span>{CURRICULUM_COPY.pathsHint}</span>
      </div>
      <div className="aie-paths stagger">
        <div className="aie-feature">
          <h3>{CURRICULUM_COPY.aiTitle}</h3>
          <p>{CURRICULUM_COPY.aiBlurb}</p>
          <p>
            React Native too: <Link href="/paths/react-native">every React Native page in one place</Link>.
          </p>
          <div className="btns">
            <Link className="btn" href={AI_PATHS_HREF}>
              {CURRICULUM_COPY.openPaths}
            </Link>
            <Link className="btn ghost" href={AI_BASICS_HREF}>
              {CURRICULUM_COPY.basics}
            </Link>
          </div>
        </div>
        <div className="aie-feature">
          <h3>{CURRICULUM_COPY.programmeTitle}</h3>
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
            {CURRICULUM_COPY.openProgramme}
          </Link>
        </div>
        {paths.map((p) => (
          <div className="aie-path" key={p.title}>
            <h3>
              <Title text={p.title} />
            </h3>
            <p>{p.blurb}</p>
            <div className="cb-grid">
              {p.items.map((it, i) => (
                <Link key={it.href} href={it.href} className={`cb ${toneClass(i)}`}>
                  <Book icon={CURRICULUM_ICONS[i % CURRICULUM_ICONS.length]} label={`STEP ${String(i + 1).padStart(2, "0")}`} />
                  <span className="cb-tx">
                    <small>Step {String(i + 1).padStart(2, "0")}</small>
                    <b>
                      <Title text={it.title} />
                    </b>
                    <span>{it.why}</span>
                    <i>{seen(it.href) ? "Opened ✓" : "Not started"}</i>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="section-h">
        <h2>Curriculum</h2>
        <input id="aie-q" type="search" placeholder="Search lessons and terms" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="aie-cur">
        {phases.map((p, idx) => {
          const its = p.lessons.filter((i) => !ql || `${i.title} ${p.title} ${i.kind}`.toLowerCase().includes(ql));
          if (!its.length) return null;
          const opened = p.lessons.filter((l) => seen(l.href)).length;
          const status = opened === 0 ? "Not started" : opened === p.lessons.length ? "Done" : "In progress";
          return (
            <details className={`aie-ph ${toneClass(idx)}`} key={p.num + (ql ? "q" : "")} open={!!ql}>
              <summary className="cb">
                <Book icon={CURRICULUM_ICONS[idx % CURRICULUM_ICONS.length]} label={`PHASE ${p.num}`} />
                <span className="cb-tx">
                  <small>
                    Phase {p.num} · {opened}/{p.lessons.length}
                  </small>
                  <b>
                    <Title text={p.title} />
                  </b>
                  <span>{p.blurb}</span>
                  <i>{status}</i>
                  <span className="cb-bar" aria-hidden>
                    <span style={{ width: `${(opened / p.lessons.length) * 100}%` }} />
                  </span>
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
          <p>{CURRICULUM_COPY.noTerms}</p>
        )}
      </dl>

      <div className="section-h">
        <h2>{CURRICULUM_COPY.loopTitle}</h2>
        <span>{CURRICULUM_COPY.loopHint}</span>
      </div>
      <div className="kit">
        <div>
          <b>{CURRICULUM_COPY.readTitle}</b>
          <p>{CURRICULUM_COPY.readText}</p>
        </div>
        <div>
          <b>{CURRICULUM_COPY.drawTitle}</b>
          <p>{CURRICULUM_COPY.drawText}</p>
        </div>
        <div>
          <b>{CURRICULUM_COPY.answerTitle}</b>
          <p>{CURRICULUM_COPY.answerText}</p>
        </div>
        <div>
          <b>{CURRICULUM_COPY.reviseTitle}</b>
          <p>{CURRICULUM_COPY.reviseText}</p>
        </div>
      </div>
    </div>
  );
}
