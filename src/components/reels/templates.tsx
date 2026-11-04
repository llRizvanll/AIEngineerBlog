import type { Reel } from "@/content/types";
import { Md } from "../ui";
import { guessLang, highlightLines } from "@/lib/highlight";

const words = (s?: string) => (s ? s.split(/\s+/).filter(Boolean).length : 0);
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Number of steps ("beats") in a reel. */
export function beatsOf(r: Reel): number {
  switch (r.template) {
    case "read": return r.pages.length;
    case "hook": return r.lines.length;
    case "steps": return r.items.length;
    case "compare": return r.verdict ? 3 : 2;
    case "flow": return r.nodes.length;
    case "analogy": return r.pairs.length;
    case "code": return r.beats.length;
    case "stat": return 2;
    case "quiz": return 2;
    case "upload": return 4;
  }
}

/** How long one beat stays up, in ms, before speed is applied. */
export function durationOf(r: Reel, b: number): number {
  let ms = Array.isArray(r.beatMs) ? r.beatMs[b] : r.beatMs;
  if (!ms && r.template === "read") {
    const pg = r.pages[b] || { p: "" };
    ms = Math.min(48000, Math.max(6000, (words(pg.h) + words(pg.p) + words(pg.ex)) * 300));
  }
  if (!ms) ms = r.template === "quiz" && b === 0 ? 5200 : r.template === "hook" && r.size === "m" ? 3600 : 3200;
  return ms;
}

export function captionOf(r: Reel, b: number): string {
  if (r.captions?.[b]) return r.captions[b];
  if (r.template === "flow") return r.nodes[b]?.s ?? "";
  if (r.template === "code") return r.beats[b]?.note ?? "";
  if (r.template === "quiz") return b === 0 ? "Tap an answer, or wait for it." : "";
  return r.caption ?? "";
}

const cls = (k: number, beat: number) => (k <= beat ? "show" : "") + (k === beat ? " cur" : "");

export function ReelBody({ r, beat, p, pick, onPick }: { r: Reel; beat: number; p: number; pick?: number; onPick: (i: number) => void }) {
  switch (r.template) {
    case "read":
      return (
        <div className="t-read">
          <div className="pages">
            {r.pages.map((pg, i) => (
              <div key={i} className={"sheet" + (i === beat ? " on" : "")}>
                <div className={"pg" + (pg.say ? " say" : "")}>
                  <span className="pn">{pg.say ? "Interview answer" : `${i + 1} / ${r.pages.length}`}</span>
                  {pg.h && (
                    <h3>
                      <Md text={pg.h} />
                    </h3>
                  )}
                  <p>
                    <Md text={pg.p} />
                  </p>
                  {pg.ex && (
                    <div className="pex">
                      <b>{pg.exLabel || r.exLabel || "In practice"}</b>
                      <Md text={pg.ex} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "hook":
      return (
        <div className={"t-hook " + (r.size === "m" ? "m" : "")}>
          {r.kicker && <span className="kick">{r.kicker}</span>}
          {r.lines.map((l, i) => {
            const at = r.accent ? l.indexOf(r.accent) : -1;
            return (
              <div key={i} className={"ln " + cls(i, beat)} data-b={i}>
                {at > -1 ? (
                  <>
                    {l.slice(0, at)}
                    <em>{r.accent}</em>
                    {l.slice(at + r.accent!.length)}
                  </>
                ) : (
                  l
                )}
              </div>
            );
          })}
        </div>
      );
    case "steps":
      return (
        <div className="t-steps">
          {r.heading && <h3 className="rh">{r.heading}</h3>}
          {r.items.map((it, i) => (
            <div key={i} className={"it " + cls(i, beat)} data-b={i}>
              <b>{i + 1}</b>
              <div>
                <h4>{it.h}</h4>
                {it.p && <p>{it.p}</p>}
              </div>
            </div>
          ))}
        </div>
      );
    case "compare":
      return (
        <div className="t-cmp">
          {r.heading && <h3 className="rh">{r.heading}</h3>}
          {(["left", "right"] as const).map((k, i) => (
            <div key={k} className={`col ${i ? "r" : "l"} ` + cls(i, beat)} data-b={i}>
              <span className="lab">{r[k].label}</span>
              <ul>{(r[k].items || []).map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          ))}
          {r.verdict && (
            <div className={"verdict " + cls(2, beat)} data-b={2}>
              {r.verdict}
            </div>
          )}
        </div>
      );
    case "flow":
      return (
        <div className="t-flow">
          {r.heading && <h3 className="rh">{r.heading}</h3>}
          {r.nodes.map((nd, i) => (
            <div key={i}>
              {i > 0 && (
                <div className={"arr " + cls(i, beat)} data-b={i}>
                  ↓
                </div>
              )}
              <div className={"node " + cls(i, beat)} data-b={i}>
                <b>{nd.t}</b>
                {nd.s && <span>{nd.s}</span>}
              </div>
            </div>
          ))}
        </div>
      );
    case "analogy":
      return (
        <div className="t-an">
          {r.heading && <h3 className="rh">{r.heading}</h3>}
          {r.pairs.map(([a, b], i) => (
            <div key={i} className={"pair " + cls(i, beat)} data-b={i}>
              <span>{a}</span>
              <div>→ {b}</div>
            </div>
          ))}
        </div>
      );
    case "code": {
      const cur = r.beats[beat];
      const hl = cur?.hl || [];
      const lang = r.lang || guessLang(r.lines.join("\n"));
      const html = highlightLines(r.lines.join("\n"), lang);
      const [from, to] = cur?.window ?? [0, r.lines.length - 1];
      const visible = r.lines.slice(from, to + 1);
      // Size from the largest window, so the text size stays steady between steps.
      const windows = r.beats.some((x) => x.window) ? r.beats.map((x) => x.window ?? [0, r.lines.length - 1]) : [[0, r.lines.length - 1]];
      const shown = windows.map(([a, b]) => r.lines.slice(a, b + 1));
      const cols = Math.min(52, Math.max(28, ...r.lines.map((l) => l.length)));
      const rows = Math.max(...shown.map((ls) => ls.reduce((n, l) => n + Math.max(1, Math.ceil(l.length / cols)), 0)));
      const gutter = r.firstLine !== undefined;
      const avail = r.problem ? 56 : 66;
      const fs = `min(${(avail / (rows * 1.45)).toFixed(2)}cqh, ${(90 / ((cols + (gutter ? 4 : 0)) * 0.6)).toFixed(2)}cqw, 2.3cqh)`;
      const note = cur?.note;
      return (
        <div className="t-code max">
          {r.problem ? (
            <div className="tc-prob">
              <span className="kick">{r.kicker || "Problem"}</span>
              <h3 className="rh">{r.heading || r.title}</h3>
              <p>{r.problem}</p>
            </div>
          ) : (
            <h3 className="rh">{r.heading || r.title}</h3>
          )}
          <pre style={{ fontSize: fs }} className={(hl.length ? "has-hl" : "") + (gutter ? " gut" : "")} key={cur?.window ? `pre-${beat}` : "pre-all"}>
            {visible.map((line, k) => {
              const i = from + k;
              // Soft-wrap like an editor: continuation lines hang under the line's own indentation.
              const indent = (line.match(/^ */) ?? [""])[0].length;
              return (
                <span key={i} className={"cl" + (hl.includes(i) ? " hl" : "")} style={{ paddingLeft: `calc(${indent + 2 + (gutter ? 4 : 0)}ch + 1.2cqw)`, textIndent: "-2ch" }}>
                  {gutter && <i className="cl-n">{(r.firstLine ?? 1) + i}</i>}
                  <span dangerouslySetInnerHTML={{ __html: html[i].replace(/^ +/, "") || " " }} />
                </span>
              );
            })}
          </pre>
          {note && (
            <div className="tc-note" key={`note-${beat}`}>
              <b>
                Step {beat + 1}/{r.beats.length}
              </b>
              {note}
            </div>
          )}
        </div>
      );
    }
    case "stat": {
      const v = beat === 0 ? Math.round(ease(p) * r.value) : r.value;
      return (
        <div className="t-stat">
          {r.caption && <div className="pre">{r.caption}</div>}
          <span className="v">{v.toLocaleString()}</span>
          <small>{r.unit}</small>
          {r.sub && (
            <div className={"sub " + cls(1, beat)} data-b={1}>
              {r.sub}
            </div>
          )}
        </div>
      );
    }
    case "quiz":
      return (
        <div className="t-quiz">
          <span className="kick">{r.kicker || "Quick check"}</span>
          <h3 className="rh">{r.q}</h3>
          <div className="opts">
            {r.options.map((o, i) => (
              <button
                key={i}
                type="button"
                className={"opt" + (beat >= 1 && i === +r.answer ? " right" : "") + (beat >= 1 && pick === i && i !== +r.answer ? " wrong" : "")}
                onClick={(e) => {
                  e.stopPropagation();
                  onPick(i);
                }}
              >
                {o}
              </button>
            ))}
          </div>
          {r.why && (
            <div className={"why " + cls(1, beat)} data-b={1}>
              {r.why}
            </div>
          )}
        </div>
      );
    case "upload": {
      const parts = r.parts || 12,
        k = Math.min(parts - 1, r.killAt || 7);
      let done = 0,
        fly = -1,
        status = "";
      if (beat === 0) {
        done = Math.floor(p * k);
        fly = done < k ? done : -1;
        status = "uploading · ETag saved per part";
      }
      if (beat === 1) {
        done = k;
        status = `killed · parts 1–${k} safe on disk`;
      }
      if (beat === 2) {
        done = k + Math.floor(p * (parts - k));
        fly = done < parts ? done : -1;
        status = `resuming from part ${k + 1}`;
      }
      if (beat >= 3) {
        done = parts;
        status = "done · hash verified";
      }
      return (
        <div className="t-up">
          <h3 className="rh">{r.heading || r.title}</h3>
          <div className="file">{r.file || "video.mov"}</div>
          <div className="grid">
            {Array.from({ length: parts }, (_, i) => (
              <i key={i} className={i < done ? "ok" : i === fly ? "fly" : ""}>
                {i + 1}
              </i>
            ))}
          </div>
          <div className="pct">
            <span className="pv">{Math.round((done / parts) * 100)}%</span>
            <span className="st">{status}</span>
          </div>
          <div className={"killov" + (beat === 1 ? " on" : "")}>SIGKILL</div>
        </div>
      );
    }
  }
}
