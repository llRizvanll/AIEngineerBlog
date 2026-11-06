"use client";

import Link from "next/link";
import { emptyProgramme, PROGRAMME_KEY, useLocal, type ProgrammeState } from "@/lib/store";
import { dayHref } from "@/lib/routes";

export interface DayRow {
  n: number;
  week: 1 | 2;
  stop: string;
  title: string;
  question: string;
  mock: boolean;
}

const firstOpen = (days: DayRow[], p: ProgrammeState) => days.find((d) => !p.done[d.n]);

/** Where the reader has got to, and a button that goes straight there. */
export function ProgrammeContinue({ days }: { days: DayRow[] }) {
  const [p, , ready] = useLocal<ProgrammeState>(PROGRAMME_KEY, emptyProgramme);
  const done = days.filter((d) => p.done[d.n]).length;
  const next = firstOpen(days, p);
  return (
    <div className="pg-cont">
      <div className="pg-bar" role="progressbar" aria-valuemin={0} aria-valuemax={days.length} aria-valuenow={ready ? done : 0} aria-label="Days completed">
        <i style={{ width: `${ready ? (done / days.length) * 100 : 0}%` }} />
      </div>
      <div className="pg-cont-row">
        <span>
          {ready ? done : 0} of {days.length} days done
        </span>
        {next ? (
          <Link className="btn" href={dayHref(next.n)}>
            {done ? `Continue with Day ${next.n}` : "Start Day 1"} →
          </Link>
        ) : (
          <Link className="btn" href="/revise">
            All done. Keep revising →
          </Link>
        )}
      </div>
    </div>
  );
}

export function ProgrammeDays({ days }: { days: DayRow[] }) {
  const [p] = useLocal<ProgrammeState>(PROGRAMME_KEY, emptyProgramme);
  const next = firstOpen(days, p);
  return (
    <ol className="pg-days">
      {days.map((d) => {
        const done = !!p.done[d.n];
        return (
          <li key={d.n} className={done ? "done" : next?.n === d.n ? "now" : ""}>
            <Link href={dayHref(d.n)}>
              <span className="pg-n">{done ? "✓" : d.n}</span>
              <span className="pg-tx">
                <small>
                  {d.stop}
                  {d.mock ? " · Mock" : ""}
                </small>
                <b>{d.title}</b>
                <span>{d.question}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
