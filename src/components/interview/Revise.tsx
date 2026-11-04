"use client";

import { useEffect, useMemo, useState } from "react";
import type { CriticalQ } from "@/content/types";
import { CASE_SHORT, SECTION_NAME } from "@/lib/routes";
import { emptyInterview, INTERVIEW_KEY, useLocal, type InterviewState } from "@/lib/store";
import { CritItem, critKey } from "./CritItem";

type Kind = "all" | CriticalQ[1];

export function Revise({ cases, crit }: { cases: { id: string; title: string }[]; crit: Record<string, CriticalQ[]> }) {
  const [st, update] = useLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
  const [cs, setCase] = useState("all");
  const [kind, setKind] = useState<Kind>("all");
  const [mode, setMode] = useState<"cards" | "list">("cards");
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<number[]>([]);

  const items = useMemo(() => {
    const out: { c: { id: string; title: string }; q: CriticalQ; i: number }[] = [];
    cases.forEach((c) =>
      (crit[c.id] || []).forEach((q, idx) => {
        if ((cs === "all" || cs === c.id) && (kind === "all" || kind === q[1])) out.push({ c, q, i: idx });
      })
    );
    return out;
  }, [cases, crit, cs, kind]);

  useEffect(() => {
    setOrder(items.map((_, k) => k));
    setI(0);
    setOpen(false);
  }, [items]);

  const all = useMemo(() => cases.flatMap((c) => (crit[c.id] || []).map((q, idx) => critKey(c.id, q[0], idx))), [cases, crit]);
  const got = all.filter((k) => st.crit[k]).length;
  const n = items.length;
  const it = n ? items[order[i] ?? i] : null;

  useEffect(() => {
    if (mode !== "cards") return;
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") (setI((x) => (x + 1) % Math.max(1, n)), setOpen(false));
      if (e.key === "ArrowLeft") (setI((x) => (x - 1 + n) % Math.max(1, n)), setOpen(false));
      if (e.key === " ") (e.preventDefault(), setOpen((o) => !o));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [mode, n]);

  const chip = (on: boolean, label: string, fn: () => void) => (
    <button key={label} type="button" aria-pressed={on} onClick={fn}>
      {label}
    </button>
  );

  return (
    <>
      <div className="chips" role="group" aria-label="Round">
        {chip(cs === "all", "All rounds", () => setCase("all"))}
        {cases.map((c) => chip(cs === c.id, CASE_SHORT[c.id] || c.title.slice(0, 22), () => setCase(c.id)))}
      </div>
      <div className="chips" role="group" aria-label="Kind">
        {chip(kind === "all", "All kinds", () => setKind("all"))}
        {chip(kind === "Incident", "Incidents", () => setKind("Incident"))}
        {chip(kind === "Probe", "Probes", () => setKind("Probe"))}
        {chip(kind === "Trap", "Traps", () => setKind("Trap"))}
        <span style={{ width: 12 }} />
        {chip(mode === "cards", "Cards", () => setMode("cards"))}
        {chip(mode === "list", "List", () => setMode("list"))}
      </div>
      <div className="rv-bar">
        <div className="rv-prog">
          <i style={{ width: (all.length ? Math.round((100 * got) / all.length) : 0) + "%" }} />
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--muted)" }}>
          {got} of {all.length} answered with confidence
        </span>
      </div>
      {!it && <p>No questions match this filter.</p>}
      {it && mode === "cards" && (
        <>
          <div className="rv-card flip-in" key={`${it.c.id}-${it.i}-${open}`}>
            <div className="meta">
              <span className={`k k-${it.q[1]}`} style={{ padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>
                {it.q[1]}
              </span>
              <span>{it.c.title}</span>
              <span>· {SECTION_NAME[it.q[0]] || it.q[0]}</span>
              <span style={{ marginLeft: "auto" }}>
                {i + 1} / {n}
              </span>
            </div>
            <h2>{it.q[2]}</h2>
            {open ? (
              <div className="a">{it.q[3]}</div>
            ) : (
              <p style={{ color: "var(--muted)" }}>Answer out loud first: what happened, how you stop the damage, how you fix it, how you prevent it.</p>
            )}
          </div>
          <div className="rv-btns">
            <button type="button" onClick={() => (setI((i - 1 + n) % n), setOpen(false))}>
              ← Previous
            </button>
            <button type="button" className="pri" onClick={() => setOpen((o) => !o)}>
              {open ? "Hide answer" : "Show answer"}
            </button>
            <button
              type="button"
              onClick={() => {
                const k = critKey(it.c.id, it.q[0], it.i);
                update((s) => ({ ...s, crit: { ...s.crit, [k]: !s.crit[k] } }));
              }}
            >
              {st.crit[critKey(it.c.id, it.q[0], it.i)] ? "Marked ✓" : "I can answer this"}
            </button>
            <button type="button" onClick={() => (setI((i + 1) % n), setOpen(false))}>
              Next →
            </button>
            <button
              type="button"
              onClick={() => {
                const a = items.map((_, k) => k);
                for (let x = a.length - 1; x > 0; x--) {
                  const j = Math.floor(Math.random() * (x + 1));
                  [a[x], a[j]] = [a[j], a[x]];
                }
                setOrder(a);
                setI(0);
                setOpen(false);
              }}
            >
              Shuffle
            </button>
          </div>
          <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 14 }}>
            Keys: ← → to move · space to flip
          </p>
        </>
      )}
      {mode === "list" && n > 0 && (
        <div className="rv-list">
          {items.map((x) => (
            <div key={`${x.c.id}-${x.i}`}>
              <h3 style={{ margin: "18px 0 4px", fontFamily: "var(--font-display)", fontSize: 14, color: "var(--muted)" }}>{x.c.title}</h3>
              <CritItem caseId={x.c.id} index={x.i} q={x.q} showSection />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
