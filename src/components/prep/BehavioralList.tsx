"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { BQ, Theme } from "@/content/behavioral";
import { useLocal } from "@/lib/store";

const KEY = "pae-behavioral";

export function BehavioralList({ questions, themes }: { questions: BQ[]; themes: Theme[] }) {
  const [theme, setTheme] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [st, update, hydrated] = useLocal<{ got: Record<string, boolean> }>(KEY, { got: {} });
  const got = hydrated ? questions.filter((x) => st.got[x.id]).length : 0;

  // Deep links from reels (#bq-…) open that answer.
  useEffect(() => {
    const id = location.hash.replace("#bq-", "");
    if (id && questions.some((x) => x.id === id)) {
      setOpen((o) => ({ ...o, [id]: true }));
      setTimeout(() => document.getElementById("bq-" + id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [questions]);

  const shown = useMemo(() => {
    const ql = q.toLowerCase();
    return questions.filter(
      (x) => (theme === "all" || x.theme === theme) && (!ql || `${x.q} ${x.s} ${x.a.join(" ")} ${x.testing}`.toLowerCase().includes(ql))
    );
  }, [questions, theme, q]);

  const themeOf = (id: string) => themes.find((t) => t.id === id)!;

  return (
    <>
      <div className="section-h">
        <div>
          <span className="eyebrow">Questions</span>
          <h2>Pick a theme, answer out loud, then reveal</h2>
        </div>
        <input className="prep-search" type="search" placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search questions" />
      </div>
      <div className="theme-chips">
        <button type="button" aria-pressed={theme === "all"} onClick={() => setTheme("all")}>
          All <small>{questions.length}</small>
        </button>
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={theme === t.id}
            onClick={() => setTheme(t.id)}
            style={{ "--c1": t.color[0], "--c2": t.color[1] } as CSSProperties}
          >
            <i />
            {t.title} <small>{questions.filter((x) => x.theme === t.id).length}</small>
          </button>
        ))}
      </div>
      <div className="rv-bar">
        <div className="rv-prog">
          <i style={{ width: `${(100 * got) / questions.length}%` }} />
        </div>
        <span className="prog-label">
          {got} of {questions.length} answered with confidence
        </span>
      </div>

      <div className="bq-list" key={theme}>
        {shown.map((x, i) => {
          const t = themeOf(x.theme);
          const isOpen = !!open[x.id];
          return (
            <article
              key={x.id}
              id={"bq-" + x.id}
              className={"bq" + (isOpen ? " open" : "") + (st.got[x.id] ? " got" : "")}
              style={{ "--c1": t.color[0], "--c2": t.color[1], animationDelay: `${Math.min(i, 8) * 0.03}s` } as CSSProperties}
            >
              <header>
                <span className="bq-n">{String(questions.indexOf(x) + 1).padStart(2, "0")}</span>
                <div>
                  <span className="bq-theme">
                    {t.title}
                    {x.source === "extra" && <em className="bq-extra">Engineering</em>}
                  </span>
                  <h3>{x.q}</h3>
                  <p className="bq-test">
                    <b>Testing:</b> {x.testing}
                  </p>
                </div>
              </header>
              {isOpen ? (
                <div className="bq-body">
                  <div className="star-grid">
                    <div>
                      <span>Situation</span>
                      <p>{x.s}</p>
                    </div>
                    <div>
                      <span>Task</span>
                      <p>{x.t}</p>
                    </div>
                    <div className="wide">
                      <span>Action</span>
                      <ol>
                        {x.a.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="wide res">
                      <span>Result</span>
                      <p>{x.r}</p>
                    </div>
                  </div>
                  <div className="bq-principal">
                    <b>Why it lands at principal level</b>
                    <p>{x.principal}</p>
                  </div>
                  <div className="bq-foot">
                    <div className="bq-flags">
                      <b>Red flags</b>
                      {x.redFlags.map((f) => (
                        <span key={f}>{f}</span>
                      ))}
                    </div>
                    <details className="fu">
                      <summary>Probe: {x.probe[0]}</summary>
                      <div>{x.probe[1]}</div>
                    </details>
                  </div>
                </div>
              ) : null}
              <div className="bq-act">
                <button type="button" className="btn ghost" onClick={() => setOpen((o) => ({ ...o, [x.id]: !isOpen }))}>
                  {isOpen ? "Hide model answer" : "Reveal model answer"}
                </button>
                <label className="got">
                  <input type="checkbox" checked={!!st.got[x.id]} onChange={(e) => update((s) => ({ got: { ...s.got, [x.id]: e.target.checked } }))} /> I can
                  answer this
                </label>
              </div>
            </article>
          );
        })}
        {!shown.length && <div className="empty-card">No questions match.</div>}
      </div>
    </>
  );
}
