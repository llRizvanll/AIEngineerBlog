"use client";

import Link from "next/link";
import { memo, type CSSProperties } from "react";
import { FitBody } from "./FitBody";
import { beatsOf, captionOf, durationOf, ReelBody } from "./templates";
import type { CardProps } from "./types";

function hashNum(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const ICON = {
  like: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  save: <path d="M6 3h12v18l-6-4-6 4z" />,
  share: <path d="M14 4l7 7-7 7M21 11H9a6 6 0 0 0-6 6v2" />,
};

export const ReelCard = memo(function ReelCard({ x, i, total, active, beat, p, paused, liked, saved, pick, near, h }: CardProps) {
  const { r, c } = x;
  // Only reels next to the one on screen render their content; the rest are light shells.
  if (!near)
    return (
      <section
        className="reel reel-shell"
        data-i={i}
        aria-label={r.title}
        style={{ "--rbg": c.theme.bg, "--rfg": c.theme.fg, "--rac": c.theme.accent, "--rmu": c.theme.muted } as CSSProperties}
      >
        <span>{r.title}</span>
      </section>
    );
  const n = beatsOf(r);
  const th = c.theme;
  const style = { "--rbg": th.bg, "--rfg": th.fg, "--rac": th.accent, "--rmu": th.muted } as CSSProperties;
  return (
    <section
      className={"reel" + (r.template === "read" ? " is-read" : r.template === "code" ? " is-code" : " is-quick") + (paused ? " paused" : "")}
      data-i={i}
      aria-roledescription="reel"
      aria-label={r.title}
      style={style}
    >
      <div className="r-top">
        <div className="segs">
          {Array.from({ length: n }, (_, k) => (
            <span key={k}>
              <i style={{ width: k < beat ? "100%" : k === beat && active ? `${p * 100}%` : "0" }} />
            </span>
          ))}
        </div>
        <div className="r-meta">
          <b>{c.title}</b>
          <span>
            {i + 1} / {total}
          </span>
        </div>
      </div>
      {r.template === "read" || r.template === "code" ? (
        <div className="r-body">
          <ReelBody r={r} beat={beat} p={p} pick={pick} onPick={(v) => h.pick(r.id, v)} />
        </div>
      ) : (
        <FitBody watch={`${beat}:${pick ?? ""}`}>
          <ReelBody r={r} beat={beat} p={p} pick={pick} onPick={(v) => h.pick(r.id, v)} />
        </FitBody>
      )}
      <div className="r-bottom">
        <div className="r-title">{r.title}</div>
        <div className="r-cap">{captionOf(r, beat)}</div>
        {r.tags && r.tags.length > 0 && (
          <div className="r-tags">
            {r.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}
        <div className="r-row">
          {r.cta && (
            <button type="button" className="r-cta" onClick={() => h.act("cta", r)}>
              {r.cta.label || "Read in post"} →
            </button>
          )}
          <div className="r-rail">
            <button type="button" aria-pressed={liked} aria-label="Like" onClick={() => h.act("like", r)}>
              <svg viewBox="0 0 24 24" aria-hidden>
                {ICON.like}
              </svg>
              <span>{120 + (hashNum(r.id) % 880) + (liked ? 1 : 0)}</span>
            </button>
            <button type="button" aria-pressed={saved} aria-label="Save" onClick={() => h.act("save", r)}>
              <svg viewBox="0 0 24 24" aria-hidden>
                {ICON.save}
              </svg>
              <span>Save</span>
            </button>
            <button type="button" aria-label="Copy link" onClick={() => h.act("share", r)}>
              <svg viewBox="0 0 24 24" aria-hidden>
                {ICON.share}
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
      {active && (
        <div className="reel-tap" aria-hidden>
          <button type="button" tabIndex={-1} onClick={h.back} />
          <button type="button" tabIndex={-1} onClick={h.pause} />
          <button type="button" tabIndex={-1} onClick={h.next} />
        </div>
      )}
      <div className="pp" aria-hidden>
        <span>❚❚</span>
      </div>
    </section>
  );
});
