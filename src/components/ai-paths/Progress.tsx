"use client";

import Link from "next/link";
import { aiLessonHref } from "@/lib/routes";
import { track } from "@/lib/track";
import { AI_PATHS_KEY, emptyAiPaths, useLocal, type AiPathsState } from "@/lib/store";

export interface LessonRow {
  path: string;
  slug: string;
  stop: string;
  title: string;
  question: string;
  minutes: number;
}

const keyOf = (r: { path: string; slug: string }) => `${r.path}/${r.slug}`;

export function PathContinue({ lessons, noun = "lessons" }: { lessons: LessonRow[]; noun?: string }) {
  const [p, , ready] = useLocal<AiPathsState>(AI_PATHS_KEY, emptyAiPaths);
  const done = lessons.filter((l) => p.done[keyOf(l)]).length;
  const next = lessons.find((l) => !p.done[keyOf(l)]);
  return (
    <div className="pg-cont">
      <div className="pg-bar" role="progressbar" aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={ready ? done : 0} aria-label={`${noun} completed`}>
        <i style={{ width: `${ready ? (done / lessons.length) * 100 : 0}%` }} />
      </div>
      <div className="pg-cont-row">
        <span>
          {ready ? done : 0} of {lessons.length} {noun} done
        </span>
        {next ? (
          <Link className="btn" href={aiLessonHref(next.path, next.slug)}>
            {done ? "Continue" : "Start"}: {next.stop} →
          </Link>
        ) : (
          <Link className="btn" href="/paths/ai-interviews/basics">
            All done. Keep practising →
          </Link>
        )}
      </div>
    </div>
  );
}

export function PathLessons({ lessons }: { lessons: LessonRow[] }) {
  const [p] = useLocal<AiPathsState>(AI_PATHS_KEY, emptyAiPaths);
  const next = lessons.find((l) => !p.done[keyOf(l)]);
  return (
    <ol className="pg-days">
      {lessons.map((l, i) => {
        const done = !!p.done[keyOf(l)];
        return (
          <li key={l.slug} className={done ? "done" : next?.slug === l.slug ? "now" : ""}>
            <Link href={aiLessonHref(l.path, l.slug)}>
              <span className="pg-n">{done ? "✓" : i + 1}</span>
              <span className="pg-tx">
                <small>
                  {l.stop} · {l.minutes} min
                </small>
                <b>{l.title}</b>
                <span>{l.question}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function LessonRubric({ id, lines }: { id: string; lines: string[] }) {
  const [p, update] = useLocal<AiPathsState>(AI_PATHS_KEY, emptyAiPaths);
  const score = lines.filter((_, i) => p.rubric[`${id}:${i}`]).length;
  return (
    <div className="dp-rubric">
      <ul>
        {lines.map((l, i) => {
          const k = `${id}:${i}`;
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
        {score === lines.length ? "Strong. Move on." : "Repeat the drill, and aim for the lines you missed."}
      </p>
    </div>
  );
}

export function LessonComplete({ id, nextHref, nextTitle, backHref }: { id: string; nextHref?: string; nextTitle?: string; backHref: string }) {
  const [p, update] = useLocal<AiPathsState>(AI_PATHS_KEY, emptyAiPaths);
  const done = !!p.done[id];
  return (
    <div className={"dp-done" + (done ? " on" : "")}>
      <button
        type="button"
        className={done ? "btn ghost" : "btn"}
        onClick={() => {
          if (!done) track("lesson_complete", { lesson: id });
          update((s) => ({ ...s, done: { ...s.done, [id]: !done } }));
        }}
      >
        {done ? "✓ Lesson complete. Undo" : "Mark this lesson complete"}
      </button>
      {nextHref ? (
        <Link className={done ? "btn" : "btn ghost"} href={nextHref}>
          {nextTitle} →
        </Link>
      ) : (
        <Link className="btn ghost" href={backHref}>
          Back to all paths
        </Link>
      )}
    </div>
  );
}
