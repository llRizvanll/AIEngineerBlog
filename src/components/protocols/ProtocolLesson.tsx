"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Protocol } from "@/content/types";
import { emptyLibrary, LIBRARY_KEY, useLocal, type LibraryState } from "@/lib/store";
import { hexs } from "./hex";

const KEY = "pae-proto";
type DoneState = { done: Record<string, boolean> };

export function DoneMark({ id, inline }: { id: string; inline?: boolean }) {
  const [st] = useLocal<DoneState>(KEY, { done: {} });
  if (!st.done[id]) return null;
  return inline ? <i>✓</i> : <span className="ok">✓</span>;
}

export function DoneButton({ id }: { id: string }) {
  const [st, update] = useLocal<DoneState>(KEY, { done: {} });
  return (
    <button type="button" id="pe-done" onClick={() => update((s) => ({ done: { ...s.done, [id]: !s.done[id] } }))}>
      {st.done[id] ? "Understood ✓" : "Mark as understood"}
    </button>
  );
}

export function TrackSeen({ title }: { title: string }) {
  const path = usePathname();
  const [, update, hydrated] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  useEffect(() => {
    if (hydrated) update((l) => ({ ...l, seen: { ...l.seen, [path]: { title, kind: "Protocol", at: Date.now(), pct: l.seen[path]?.pct ?? 100 } } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, path]);
  return null;
}

export function PacketFlow({ actors, steps }: { actors: string[]; steps: Protocol["steps"] }) {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = actors.length;

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setK((x) => {
        if (x >= steps.length - 1) {
          setPlaying(false);
          return x;
        }
        return x + 1;
      });
    }, 1600);
    return () => clearInterval(timer.current!);
  }, [playing, steps.length]);

  return (
    <div id="pe-flow">
      <div className="pe-flow">
        <div className="pe-lanes" style={{ "--n": n } as CSSProperties}>
          {actors.map((a) => (
            <div className="act" key={a}>
              {a}
            </div>
          ))}
        </div>
        <div className="pe-steps">
          {steps.map((s, i) => {
            const a = Math.min(s[0], s[1]),
              b = Math.max(s[0], s[1]);
            return (
              <div
                key={i}
                className={"pe-step" + (i <= k ? " on" : "") + (i === k ? " now" : "")}
                style={{ "--n": n } as CSSProperties}
                onClick={() => (setPlaying(false), setK(i))}
              >
                <div className={"ar " + (s[1] > s[0] ? "r" : "l")} style={{ gridColumn: `${a + 1}/${b + 2}` }}>
                  <span>{s[2]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pe-cap" key={k}>
        <b>
          Step {k + 1} of {steps.length}
        </b>
        <p>{steps[k][3]}</p>
      </div>
      <div className="pe-ctl">
        <button type="button" onClick={() => (setPlaying(false), setK((k + steps.length - 1) % steps.length))}>
          ← Back
        </button>
        <button
          type="button"
          className="pri"
          onClick={() => {
            if (playing) return setPlaying(false);
            setK(0);
            setPlaying(true);
          }}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={() => (setPlaying(false), setK((k + 1) % steps.length))}>
          Next →
        </button>
      </div>
    </div>
  );
}

export function PacketDecoder({ packets }: { packets: Protocol["packets"] }) {
  const [ti, setTi] = useState(0);
  const [sel, setSel] = useState(0);
  const p = packets[ti];
  const bytes: [string, number][] = [];
  p.fields.forEach((f, i) => hexs(f.x).forEach((h) => bytes.push([h, i])));
  const rows: [string, number][][] = [];
  for (let r = 0; r < bytes.length; r += 16) rows.push(bytes.slice(r, r + 16));
  const f = p.fields[sel];
  const fh = hexs(f.x);
  let off = 0;

  return (
    <div id="pe-pkt">
      {packets.length > 1 ? (
        <div className="pe-tabs" role="tablist">
          {packets.map((t, i) => (
            <button key={t.tab} role="tab" aria-selected={i === ti} className={i === ti ? "on" : undefined} onClick={() => (setTi(i), setSel(0))}>
              {t.tab}
            </button>
          ))}
        </div>
      ) : (
        <div className="pe-tabs">
          <span className="lone">{p.tab}</span>
        </div>
      )}
      <p className="pe-note">{p.note}</p>
      <div className="pe-dec">
        <div className="pe-dump" id="pe-dump">
          {rows.length ? (
            rows.map((row, r) => (
              <div className="r" key={r}>
                <span className="o">{(r * 16).toString(16).padStart(4, "0")}</span>
                <span className="b">
                  {row.map(([h, fi], j) => (
                    <i key={j} className={`c${fi % 8}` + (fi === sel ? " sel" : "")} onClick={() => setSel(fi)}>
                      {h}
                    </i>
                  ))}
                </span>
                <span className="a">
                  {row.map(([h, fi], j) => {
                    const c = parseInt(h, 16);
                    return (
                      <i key={j} className={`c${fi % 8}` + (fi === sel ? " sel" : "")} onClick={() => setSel(fi)}>
                        {c >= 32 && c < 127 ? String.fromCharCode(c) : "·"}
                      </i>
                    );
                  })}
                </span>
              </div>
            ))
          ) : (
            <div className="r">
              <span className="o">—</span>
            </div>
          )}
        </div>
        <div id="pe-detail">
          <div className="pe-det" key={`${ti}-${sel}`}>
            <div>
              <small>Field</small>
              <b>{f.n}</b>
            </div>
            <div>
              <small>Length</small>
              <b>
                {fh.length} byte{fh.length === 1 ? "" : "s"}
              </b>
            </div>
            {fh.length > 0 && fh.length <= 4 && f.k !== "t" && (
              <div>
                <small>Decimal</small>
                <b>{parseInt(f.x, 16)}</b>
              </div>
            )}
            {f.k === "t" && (
              <div>
                <small>Text</small>
                <b className="mono">
                  {String.fromCharCode(...fh.map((x) => parseInt(x, 16)))
                    .replace(/\r/g, "␍")
                    .replace(/\n/g, "␊")
                    .slice(0, 80)}
                </b>
              </div>
            )}
            <p>{f.d}</p>
          </div>
        </div>
      </div>
      <div className="pe-tbl">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Field</th>
              <th>Offset</th>
              <th>Bytes</th>
              <th>Hex</th>
            </tr>
          </thead>
          <tbody>
            {p.fields.map((fd, i) => {
              const h = hexs(fd.x),
                o = off;
              off += h.length;
              return (
                <tr key={i} className={i === sel ? "sel" : undefined} onClick={() => setSel(i)}>
                  <td>
                    <i className={`dot c${i % 8}`} />
                  </td>
                  <td className="nm">{fd.n}</td>
                  <td className="of">{o}</td>
                  <td className="ln">{h.length}</td>
                  <td className="hx">{h.length > 12 ? h.slice(0, 8).join(" ") + " …" : h.join(" ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
