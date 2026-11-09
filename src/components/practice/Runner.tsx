"use client";

import { STORAGE } from "@/config/storage";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { check, LEVELS, PROBLEMS, type Level, type Problem } from "@/content/practice";
import { useLocal } from "@/lib/store";
import { Icon } from "../Icons";
import { Title } from "../HubCards";
import { RUNNER_COPY } from "@/content/ui-copy";

const KEY = STORAGE.practice;
type Done = Record<string, "ok" | "shown">;

/** One problem at a time: read, answer, check, then see how it goes. Progress stays in this browser. */
export function Runner() {
  const [done, update, hydrated] = useLocal<Done>(KEY, {});
  const [level, setLevel] = useState<Level | null>(null);
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "wrong" | "ok" | "shown">("idle");
  const [hint, setHint] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  const list = useMemo(() => (level ? PROBLEMS.filter((p) => p.level === level) : []), [level]);
  const p: Problem | undefined = list[i];

  useEffect(() => {
    setInput("");
    setState("idle");
    setHint(false);
    field.current?.focus();
  }, [i, level]);

  const mark = (id: string, v: "ok" | "shown") => update((d) => ({ ...d, [id]: d[id] === "ok" ? "ok" : v }));
  const submit = (value: string | number) => {
    if (!p || value === "") return;
    if (check(p, value)) {
      setState("ok");
      mark(p.id, "ok");
    } else setState("wrong");
  };
  const show = () => {
    if (!p) return;
    setState("shown");
    mark(p.id, "shown");
  };

  if (!level) {
    return (
      <section className="ap-card pr-pick">
        <div>
          <h2>
            Where do you want to <em>start?</em>
          </h2>
          <p>{RUNNER_COPY.pickHint}</p>
          <div className="pr-levels">
            {LEVELS.map((l) => {
              const set = PROBLEMS.filter((x) => x.level === l.id);
              const got = hydrated ? set.filter((x) => done[x.id] === "ok").length : 0;
              return (
                <button key={l.id} type="button" onClick={() => { setLevel(l.id); setI(0); }}>
                  <span>
                    <b>{l.title}</b>
                    <small>{l.blurb}</small>
                  </span>
                  <i>
                    {got}/{set.length} <Icon name="arrow" size={18} />
                  </i>
                </button>
              );
            })}
          </div>
        </div>
        <div className="week" aria-hidden>
          <div className="week-card">
            <small>Problems</small>
            <div className="week-dots">
              {PROBLEMS.slice(0, 7).map((x) => (
                <span key={x.id}>
                  <i className={hydrated && done[x.id] === "ok" ? "on" : undefined} />
                  {x.topic.split(" · ")[0][0]}
                </span>
              ))}
            </div>
          </div>
          <b>
            Fresh <em>numbers</em>
          </b>
          <span>{RUNNER_COPY.checked}</span>
        </div>
      </section>
    );
  }

  if (!p) {
    const got = list.filter((x) => done[x.id] === "ok").length;
    return (
      <section className="ap-card pr-end">
        <h2>
          That is the <em>set.</em>
        </h2>
        <p>
          {got} of {list.length} right on your own. The rest are marked so you can come back to them.
        </p>
        <div className="tk-act">
          <button type="button" className="btn" onClick={() => setI(0)}>
            Go again
          </button>
          <button type="button" className="tk-link" onClick={() => setLevel(null)}>
            Choose another level
          </button>
        </div>
      </section>
    );
  }

  const answered = state === "ok" || state === "shown";
  const lvl = LEVELS.find((l) => l.id === level)!;

  return (
    <div className="pr-wrap">
      <div className="pr-bar">
        <button type="button" className="tk-link" onClick={() => setLevel(null)}>
          ‹ Practice
        </button>
        <span>
          {p.topic.split(" · ")[0]} · <b>{p.topic.split(" · ")[1]}</b>
        </span>
      </div>
      <section className="ap-card pr-card">
        <h2>
          <Title text={`${p.title} at ${lvl.title.toLowerCase()}`.replace("at new to this", "for beginners").replace("at i know the basics", "at basics level")} />
        </h2>
        <p className="pr-sub">{lvl.blurb}</p>
        <div className="pr-seg" role="progressbar" aria-valuemin={1} aria-valuemax={list.length} aria-valuenow={i + 1} aria-label={`Problem ${i + 1} of ${list.length}`}>
          {list.map((x, k) => (
            <span key={x.id} className={k === i ? "now" : done[x.id] === "ok" ? "ok" : done[x.id] === "shown" ? "sh" : undefined} />
          ))}
        </div>

        <p className="pr-q">{p.prompt}</p>
        {p.table && (
          <table className="pr-table">
            <thead>
              <tr>
                {p.table[0].map((c, k) => (
                  <th key={k}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.table.slice(1).map((r, k) => (
                <tr key={k}>
                  {r.map((c, m) => (
                    <td key={m}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {p.kind === "choice" ? (
          <div className="pr-opts">
            {p.options.map((o, k) => (
              <button
                key={o}
                type="button"
                disabled={answered}
                className={answered && k === p.answer ? "right" : state === "wrong" && Number(input) === k ? "bad" : undefined}
                onClick={() => {
                  setInput(String(k));
                  submit(k);
                }}
              >
                <i>{String.fromCharCode(65 + k)}</i>
                {o}
              </button>
            ))}
          </div>
        ) : (
          <form
            className="pr-answer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!answered) submit(input);
            }}
          >
            <div className="pr-meta">
              <label htmlFor="ans">Your answer</label>
              <span>
                within ±{p.tolerance}
                {p.unit ? ` ${p.unit}` : ""}
              </span>
            </div>
            <div className="pr-row">
              <input id="ans" ref={field} inputMode="decimal" autoComplete="off" value={answered && state === "shown" ? String(p.answer) : input} onChange={(e) => { setInput(e.target.value); setState("idle"); }} placeholder="Your answer" readOnly={answered} />
              <button className="btn" type="submit" disabled={answered || !input}>
                Check
              </button>
            </div>
          </form>
        )}

        {state === "wrong" && <p className="pr-note bad" role="status">Not quite. Check the working, or use the hint.</p>}
        {state === "ok" && <p className="pr-note good" role="status">That is it.</p>}

        {!answered && (
          <div className="pr-help">
            <button type="button" className="tk-link" onClick={() => setHint(true)}>
              Hint
            </button>
            <button type="button" className="tk-link" onClick={show}>
              Show me
            </button>
          </div>
        )}
        {hint && !answered && <p className="pr-hint">{p.hint}</p>}

        {answered && (
          <div className="pr-sol">
            <p>
              <b>Here&apos;s how it goes.</b> {p.solution}
            </p>
            <p className="pr-learn">
              Learn this: <Link href={p.learn.href}>{p.learn.title}</Link>
            </p>
            <button type="button" className="btn pr-next" onClick={() => setI(i + 1)}>
              {i + 1 < list.length ? "Next problem" : "Finish"} <Icon name="arrow" size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
