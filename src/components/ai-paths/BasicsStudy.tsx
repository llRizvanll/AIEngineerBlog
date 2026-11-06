"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Revise, type ReviseCard } from "@/components/interview/Revise";
import type { BasicSkill } from "@/content/ai-interviews/types";
import { track } from "@/lib/track";
import { AI_PATHS_KEY, emptyAiPaths, useLocal, type AiPathsState } from "@/lib/store";

type Mode = "read" | "memorise" | "practise";
const MODES: [Mode, string][] = [
  ["read", "Read"],
  ["memorise", "Memorise"],
  ["practise", "Practise"],
];

function Drill({ skill, featured }: { skill: BasicSkill; featured?: boolean }) {
  const [p, update] = useLocal<AiPathsState>(AI_PATHS_KEY, emptyAiPaths);
  const times = p.drills[skill.id] ?? 0;
  return (
    <section className={"bs-drill" + (featured ? " on" : "")}>
      <div className="bs-drill-top">
        <small>
          {skill.title} · {skill.drill.minutes} min
        </small>
        {times > 0 && <small>Done {times === 1 ? "once" : `${times} times`}</small>}
      </div>
      <h3>{skill.drill.title}</h3>
      <ol>
        {skill.drill.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <button
        type="button"
        className="btn ghost"
        onClick={() => {
          track("drill_done", { skill: skill.id });
          update((s) => ({ ...s, drills: { ...s.drills, [skill.id]: (s.drills[skill.id] ?? 0) + 1 } }));
        }}
      >
        I did this
      </button>
    </section>
  );
}

export function BasicsStudy({ skills, cards }: { skills: BasicSkill[]; cards: ReviseCard[] }) {
  const [mode, setMode] = useState<Mode>("read");
  const [featured, setFeatured] = useState<string | null>(null);
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "memorise" || m === "practise") setMode(m);
  }, []);
  const feature = () => {
    const others = skills.filter((s) => s.id !== featured);
    setFeatured(others[Math.floor(Math.random() * others.length)].id);
  };
  const shown = featured ? [...skills.filter((s) => s.id === featured), ...skills.filter((s) => s.id !== featured)] : skills;

  return (
    <>
      <div className="bs-modes" role="tablist" aria-label="Study mode">
        {MODES.map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}>
            {label}
          </button>
        ))}
      </div>

      {mode === "read" && (
        <div className="bs-read">
          {skills.map((s, i) => (
            <section key={s.id} id={s.id}>
              <h2>
                <span>{i + 1}</span>
                {s.title}
              </h2>
              <p className="bs-why">{s.why}</p>
              {s.read.map((r) => (
                <p key={r}>{r}</p>
              ))}
              <details className="bs-cards">
                <summary>The {s.memorise.length} things to remember</summary>
                <dl>
                  {s.memorise.map((c) => (
                    <div key={c.q}>
                      <dt>{c.q}</dt>
                      <dd>{c.a}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              {s.lesson && (
                <p className="bs-more">
                  <Link href={s.lesson}>Read the full lesson →</Link>
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {mode === "memorise" && (
        <div className="bs-mem">
          <p>Answer out loud, flip, then rate yourself. Hard cards come back soon, and easy ones wait longer. These cards also appear on the Revise page, and your progress carries across.</p>
          <Revise cards={cards} groups={skills.map((s) => ({ id: s.id, label: s.title }))} />
        </div>
      )}

      {mode === "practise" && (
        <div className="bs-prac">
          <div className="bs-pick">
            <p>Got a few minutes? Take any drill. Most need only your phone or a sheet of paper.</p>
            <button type="button" className="btn" onClick={feature}>
              Pick one for me
            </button>
          </div>
          {shown.map((s) => (
            <Drill key={s.id} skill={s} featured={s.id === featured} />
          ))}
        </div>
      )}
    </>
  );
}
