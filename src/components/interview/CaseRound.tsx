"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CriticalQ } from "@/content/types";
import { emptyInterview, INTERVIEW_KEY, useLocal, type InterviewState } from "@/lib/store";
import { Reading } from "../Reading";
import { Whiteboard } from "./Whiteboard";
import { CritItem } from "./CritItem";

export interface RoundSection {
  key: string;
  title: string;
  prompt: string;
  body: ReactNode;
  crit: { q: CriticalQ; i: number }[];
}

const RUBRIC: [string, string][] = [
  ["Requirements", "Asked clarifying questions and stated assumptions."],
  ["Numbers", "Estimated scale and used it to make a decision."],
  ["Architecture", "Clear components with responsibilities and data flow."],
  ["Depth", "Went deep on the hardest part with real mechanisms."],
  ["Trade-offs", "Named alternatives and why they lost."],
  ["Operations", "Covered failures, monitoring and rollout."],
  ["Leadership", "Explained how the team would build and evolve it."],
];

export function CaseRound({ id, title, minutes, sections, next }: { id: string; title: string; minutes: number; sections: RoundSection[]; next: { id: string; title: string } }) {
  const [st, update] = useLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const notes = st.notes[id] || {};

  return (
    <Reading title={title} kind="Round" articleId="case-article" articleClass={st.practice ? "practice" : ""} railTitle="The round">
      <RoundTimer minutes={minutes} practice={st.practice} onPractice={(v) => update((s) => ({ ...s, practice: v }))} />
      {sections.map((s, i) => (
        <section key={s.key} id={`cs-${s.key}`} data-toc={s.title}>
          <h2>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            {s.title}
          </h2>
          {s.key !== "board" && s.key !== "level" && (
            <div className="try">
              <label htmlFor={`nt-${s.key}`}>Your turn: {s.prompt}</label>
              <textarea
                id={`nt-${s.key}`}
                rows={4}
                placeholder="Write your answer, then reveal the model answer."
                value={notes[s.key] || ""}
                onChange={(e) => update((x) => ({ ...x, notes: { ...x.notes, [id]: { ...(x.notes[id] || {}), [s.key]: e.target.value } } }))}
              />
              {!revealed[s.key] && (
                <button type="button" className="reveal" onClick={() => setRevealed((r) => ({ ...r, [s.key]: true }))}>
                  Reveal model answer
                </button>
              )}
            </div>
          )}
          <div className={"ans" + (revealed[s.key] ? " open" : "")}>
            {s.body}
            {s.key === "level" && (
              <>
                <h3>Score yourself</h3>
                <div className="rubric">
                  {RUBRIC.map(([k, d]) => (
                    <label key={k}>
                      <input type="checkbox" /> <b>{k}</b> {d}
                    </label>
                  ))}
                </div>
              </>
            )}
            {s.key === "board" && <Whiteboard caseId={id} />}
          </div>
          {s.crit.length > 0 && (
            <div className="crit">
              <h4>
                Critical Q&amp;A <span className="ct">{s.crit.length}</span>
              </h4>
              <p className="sub">Realistic incidents and probes for this section. Answer out loud, then open.</p>
              {s.crit.map(({ q, i }) => (
                <CritItem key={i} caseId={id} index={i} q={q} />
              ))}
            </div>
          )}
        </section>
      ))}
      <div className="next">
        <div>
          <div className="kicker">Next round</div>
          <b>{next.title}</b>
        </div>
        <div className="btns">
          <button type="button" className="btn ghost" onClick={() => update((s) => ({ ...s, done: { ...s.done, [id]: !s.done[id] } }))}>
            {st.done[id] ? "Practised ✓" : "Mark as practised"}
          </button>
          <Link className="btn" href={`/interview/${next.id}`}>
            Next case →
          </Link>
        </div>
      </div>
    </Reading>
  );
}

const PHASES: [string, number][] = [
  ["Clarify", 0.1],
  ["Estimate", 0.1],
  ["High-level design", 0.25],
  ["Deep dive", 0.35],
  ["Trade-offs and wrap-up", 0.2],
];

function RoundTimer({ minutes, practice, onPractice }: { minutes: number; practice: boolean; onPractice: (v: boolean) => void }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(timer.current!);
  }, [running]);
  useEffect(() => {
    if (left === 0) setRunning(false);
  }, [left]);

  const used = total - left;
  let acc = 0,
    phase = PHASES[PHASES.length - 1][0];
  const fills = PHASES.map(([name, f]) => {
    const len = f * total;
    const fill = Math.max(0, Math.min(1, (used - acc) / len));
    if (used >= acc && used < acc + len) phase = name;
    acc += len;
    return fill;
  });
  const label = left === total && !running ? "Ready" : left <= 0 ? "Time" : phase;

  return (
    <div className="round" id="round">
      <div className="round-l">
        <b>{label}</b>
        <span>
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </span>
      </div>
      <div className="round-bar">
        {PHASES.map(([name, f], i) => (
          <span key={name} style={{ flex: f }}>
            <i style={{ width: fills[i] * 100 + "%" }} />
            <em>{name}</em>
          </span>
        ))}
      </div>
      <div className="round-r">
        <button type="button" id="rt-start" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : left === total ? "Start the clock" : "Resume"}
        </button>
        <button
          type="button"
          id="rt-reset"
          onClick={() => {
            setRunning(false);
            setLeft(total);
          }}
        >
          Reset
        </button>
        <label className="pm">
          <input type="checkbox" checked={practice} onChange={(e) => onPractice(e.target.checked)} /> Practice mode
        </label>
      </div>
    </div>
  );
}
