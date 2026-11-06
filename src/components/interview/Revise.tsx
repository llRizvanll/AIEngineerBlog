"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyInterview, emptySrs, INTERVIEW_KEY, intervalLabel, nextSrs, SRS_KEY, useLocal, type InterviewState, type Rating, type SrsState } from "@/lib/store";

export interface ReviseCard {
  key: string;
  /** what a deep link uses: round:index, or the flashcard's asset id */
  link: string;
  group: string;
  groupLabel: string;
  kind: string;
  q: string;
  a: string;
  why: string;
  source: string;
}

type Scope = "due" | "all";
const RATINGS: [Rating, string][] = [
  ["again", "Again"],
  ["good", "Good"],
  ["easy", "Easy"],
];

export function Revise({ cards, groups }: { cards: ReviseCard[]; groups: { id: string; label: string }[] }) {
  const [srs, updateSrs, hydrated] = useLocal<SrsState>(SRS_KEY, emptySrs);
  const [, updateIv] = useLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
  const [scope, setScope] = useState<Scope>("due");
  const [group, setGroup] = useState("all");
  const [kind, setKind] = useState("all");
  const [filters, setFilters] = useState(false);
  const [list, setList] = useState(false);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const link = new URLSearchParams(window.location.search).get("card");
    const hit = link ? cards.find((c) => c.link === link) : undefined;
    if (hit) setPinned(hit.key);
  }, [cards]);

  const filtered = useMemo(() => cards.filter((c) => (group === "all" || c.group === group) && (kind === "all" || c.kind === kind)), [cards, group, kind]);
  const isDue = useCallback(
    (key: string) => {
      const s = srs.cards[key];
      return !s || s.due <= now;
    },
    [srs, now]
  );
  const queue = useMemo(() => {
    if (scope === "all") return filtered;
    // Cards you have seen and that fell due come first, then new ones.
    const due = filtered.filter((c) => isDue(c.key));
    return [...due.filter((c) => srs.cards[c.key]), ...due.filter((c) => !srs.cards[c.key])];
  }, [filtered, scope, isDue, srs]);

  const pinnedCard = pinned ? cards.find((c) => c.key === pinned) : undefined;
  const card = pinnedCard ?? queue[Math.min(cursor, Math.max(queue.length - 1, 0))];

  const seenCount = cards.filter((c) => srs.cards[c.key]).length;
  const dueSeen = cards.filter((c) => srs.cards[c.key] && isDue(c.key)).length;
  const strong = cards.filter((c) => (srs.cards[c.key]?.box ?? 0) >= 3).length;

  const next = useCallback(() => {
    setOpen(false);
    setPinned(null);
  }, []);

  const rate = useCallback(
    (rating: Rating) => {
      if (!card) return;
      const at = Date.now();
      updateSrs((s) => ({ cards: { ...s.cards, [card.key]: nextSrs(s.cards[card.key], rating, at) } }));
      updateIv((s) => ({ ...s, crit: { ...s.crit, [card.key]: rating !== "again" } }));
      setNow(at);
      if (scope === "all") setCursor((c) => (c + 1) % Math.max(queue.length, 1));
      next();
    },
    [card, updateSrs, updateIv, scope, queue.length, next]
  );

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (open && e.key === "1") rate("again");
      if (open && e.key === "2") rate("good");
      if (open && e.key === "3") rate("easy");
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, rate]);

  const chip = (on: boolean, label: string, fn: () => void) => (
    <button key={label} type="button" aria-pressed={on} onClick={fn}>
      {label}
    </button>
  );

  return (
    <>
      <div className="srs-top">
        <div className="srs-tabs" role="group" aria-label="Which cards">
          {chip(scope === "due", hydrated ? `Due (${filtered.filter((c) => isDue(c.key)).length})` : "Due", () => (setScope("due"), setCursor(0), next()))}
          {chip(scope === "all", `All (${filtered.length})`, () => (setScope("all"), setCursor(0), next()))}
        </div>
        <button type="button" className="pf-more" aria-expanded={filters} onClick={() => setFilters((f) => !f)}>
          Filters{group !== "all" || kind !== "all" ? " ·" : ""}
        </button>
      </div>
      {filters && (
        <div className="srs-filters">
          <div className="chips" role="group" aria-label="Topic">
            {chip(group === "all", "All topics", () => setGroup("all"))}
            {groups.map((g) => chip(group === g.id, g.label, () => setGroup(g.id)))}
          </div>
          <div className="chips" role="group" aria-label="Kind">
            {["all", "Incident", "Probe", "Trap", "Recall"].map((k) => chip(kind === k, k === "all" ? "All kinds" : k, () => setKind(k)))}
            {chip(list, "List view", () => setList((l) => !l))}
          </div>
        </div>
      )}
      <div className="rv-bar">
        <div className="rv-prog">
          <i style={{ width: `${Math.round((100 * strong) / Math.max(cards.length, 1))}%` }} />
        </div>
        <span className="srs-stats">
          {seenCount} reviewed · {dueSeen} due again · {strong} strong
        </span>
      </div>

      {!list && !card && <div className="empty-card">Nothing due. Your next cards return on schedule, or switch to All.</div>}

      {!list && card && (
        <>
          <div className="rv-card flip-in" key={`${card.key}-${open}`}>
            <div className="meta">
              <span className={`k k-${card.kind}`} style={{ padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>
                {card.kind}
              </span>
              <span>{card.groupLabel}</span>
            </div>
            <h2>{card.q}</h2>
            {open ? (
              <>
                <div className="a">{card.a}</div>
                <dl className="srs-back">
                  <dt>Why it matters</dt>
                  <dd>{card.why}</dd>
                  <dt>Source</dt>
                  <dd>{card.source}</dd>
                </dl>
              </>
            ) : (
              <p style={{ color: "var(--muted)" }}>Answer out loud first, then flip.</p>
            )}
          </div>
          <div className="rv-btns">
            {open ? (
              RATINGS.map(([r, label]) => (
                <button key={r} type="button" className={r === "good" ? "pri" : undefined} onClick={() => rate(r)}>
                  {label} <small>{intervalLabel(srs.cards[card.key], r)}</small>
                </button>
              ))
            ) : (
              <button type="button" className="pri" onClick={() => setOpen(true)}>
                Show answer
              </button>
            )}
          </div>
          <p className="srs-keys">Keys: space flips · 1 Again · 2 Good · 3 Easy</p>
        </>
      )}

      {list && (
        <div className="rv-list">
          {filtered.map((c) => (
            <details key={c.key} className="cq">
              <summary>
                <span className={`k k-${c.kind}`}>{c.kind}</span>
                <span>
                  {c.q}
                  <span className="c"> · {c.groupLabel}</span>
                </span>
              </summary>
              <div className="a">{c.a}</div>
              <p className="srs-src">
                <b>Why it matters:</b> {c.why} <b>Source:</b> {c.source}
              </p>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
