"use client";

import Link from "next/link";
import { emptyProgramme, PROGRAMME_KEY, useLocal, type ProgrammeState } from "@/lib/store";
import { dayHref, PROGRAMME_HREF } from "@/lib/routes";

interface PlanItem {
  kind: string;
  href: string;
  title: string;
  minutes: number;
  focus: string;
}

export function DayChecklist({ day, items }: { day: number; items: PlanItem[] }) {
  const [p, update] = useLocal<ProgrammeState>(PROGRAMME_KEY, emptyProgramme);
  const toggle = (k: string) => update((s) => ({ ...s, items: { ...s.items, [k]: !s.items[k] } }));
  return (
    <ul className="dp-items">
      {items.map((it) => {
        const k = `${day}:${it.href}`;
        return (
          <li key={it.href} className={(p.items[k] ? "on " : "") + `k-${it.kind.toLowerCase()}`}>
            <input type="checkbox" checked={!!p.items[k]} onChange={() => toggle(k)} aria-label={`Mark done: ${it.title}`} />
            <div>
              <div className="dp-top">
                <span className="dp-kind">{it.kind}</span>
                <span className="dp-min">{it.minutes} min</span>
              </div>
              <Link href={it.href}>{it.title}</Link>
              <p>{it.focus}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function DayRubric({ day, lines }: { day: number; lines: string[] }) {
  const [p, update] = useLocal<ProgrammeState>(PROGRAMME_KEY, emptyProgramme);
  const score = lines.filter((_, i) => p.rubric[`${day}:${i}`]).length;
  return (
    <div className="dp-rubric">
      <ul>
        {lines.map((l, i) => {
          const k = `${day}:${i}`;
          return (
            <li key={l}>
              <label>
                <input type="checkbox" checked={!!p.rubric[k]} onChange={() => update((s) => ({ ...s, rubric: { ...s.rubric, [k]: !s.rubric[k] } }))} />
                <span>{l}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="dp-score">
        <b>
          {score} of {lines.length}
        </b>{" "}
        {score >= 7 ? "Strong. Move on." : score >= 5 ? "Close. Repeat the days behind what you missed, then move on." : "Revisit the days behind what you missed, then run the round again."}
      </p>
    </div>
  );
}

export function DayComplete({ day, total, nextTitle }: { day: number; total: number; nextTitle?: string }) {
  const [p, update] = useLocal<ProgrammeState>(PROGRAMME_KEY, emptyProgramme);
  const done = !!p.done[day];
  return (
    <div className={"dp-done" + (done ? " on" : "")}>
      <button type="button" className={done ? "btn ghost" : "btn"} onClick={() => update((s) => ({ ...s, done: { ...s.done, [day]: !done } }))}>
        {done ? "✓ Day complete. Undo" : `Mark Day ${day} complete`}
      </button>
      {day < total ? (
        <Link className={done ? "btn" : "btn ghost"} href={dayHref(day + 1)}>
          Day {day + 1}: {nextTitle} →
        </Link>
      ) : (
        <Link className="btn ghost" href={PROGRAMME_HREF}>
          Back to the programme
        </Link>
      )}
    </div>
  );
}
