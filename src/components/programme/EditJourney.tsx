"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JourneyStop } from "@/content/programme/mobile-principal";
import { dayHref } from "@/lib/routes";

/** One edit, stop by stop. Rows that changed since the previous stop are highlighted. */
export function EditJourney({ stops }: { stops: JourneyStop[] }) {
  const [i, setI] = useState(0);
  const rail = useRef<HTMLOListElement>(null);
  const s = stops[i];
  const prev = i > 0 ? new Map(stops[i - 1].state) : null;

  useEffect(() => {
    const r = rail.current;
    const el = r?.children[i] as HTMLElement | undefined;
    if (r && el) r.scrollTo({ left: el.offsetLeft - r.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [i]);

  return (
    <div className="ej">
      <ol className="ej-rail" ref={rail}>
        {stops.map((x, k) => (
          <li key={x.title} className={k === i ? "on" : k < i ? "past" : ""}>
            <button type="button" onClick={() => setI(k)} aria-current={k === i ? "step" : undefined} aria-label={`${x.at}: ${x.title}`}>
              <span className="ej-dot">{k + 1}</span>
              <span className="ej-at">{x.at}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="ej-panel" data-where={s.where} key={s.title}>
        <div className="ej-text">
          <div className="ej-meta">
            <span className="ej-where">{s.where}</span>
            <span>{s.at}</span>
          </div>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
          <Link href={dayHref(s.day)}>Learn this on Day {s.day} →</Link>
        </div>
        <dl className="ej-state">
          <div className="ej-state-h">System state</div>
          {s.state.map(([k, v]) => (
            <div key={k} className={prev && prev.get(k) !== v ? "chg" : ""}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="ej-nav">
        <button type="button" className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
          ← Earlier
        </button>
        <span>
          {i + 1} of {stops.length}
        </span>
        <button type="button" className="btn" disabled={i === stops.length - 1} onClick={() => setI(i + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
