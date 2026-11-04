"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Reel, ReelCollection } from "@/content/types";
import { routeFor } from "@/lib/routes";
import type { CollectionSummary } from "@/lib/reel-summary";
import { useLocal } from "@/lib/store";
import { beatsOf, captionOf, durationOf, ReelBody } from "./templates";

interface Item {
  r: Reel;
  c: ReelCollection;
}

interface ReelStore {
  likes: Record<string, boolean>;
  saves: Record<string, boolean>;
  done: Record<string, boolean>;
  settings: { autoBeats: boolean; autoNext: boolean; captions: boolean; speed: number; size: "s" | "m" | "l" };
}
const KEY = "pae-reels";
const EMPTY: ReelStore = {
  likes: {},
  saves: {},
  done: {},
  settings: { autoBeats: true, autoNext: true, captions: true, speed: 1, size: "m" },
};

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

export function ReelsPlayer({ collections, summaries, filter }: { collections: ReelCollection[]; summaries: CollectionSummary[]; filter: string }) {
  const router = useRouter();
  const [store, update, hydrated] = useLocal<ReelStore>(KEY, EMPTY);
  const S = { ...EMPTY.settings, ...store.settings };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState("");

  const list: Item[] = useMemo(() => {
    return collections.flatMap((c) => c.reels.map((r) => ({ r, c })));
  }, [collections, filter]);

  const feed = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const [beat, setBeat] = useState(0);
  const [p, setP] = useState(0);
  const [paused, setPaused] = useState(false);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const startAt = useRef(0);
  const pausedAt = useRef(0);
  const beatDone = useRef(false);

  const say = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1600);
  };

  const markDone = useCallback((id: string) => update((s) => (s.done[id] ? s : { ...s, done: { ...s.done, [id]: true } })), [update]);

  const goTo = useCallback((i: number) => {
    const el = feed.current?.querySelector<HTMLElement>(`.reel[data-i="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Which reel is on screen.
  useEffect(() => {
    const root = feed.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) setCur(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { root, threshold: [0.6] }
    );
    root.querySelectorAll(".reel").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [list]);

  // Restart when the reel or step changes.
  useEffect(() => {
    setBeat(0);
    setPaused(false);
  }, [cur]);
  useEffect(() => {
    startAt.current = performance.now();
    beatDone.current = false;
    setP(0);
  }, [cur, beat]);

  const item = list[cur];
  const n = item ? beatsOf(item.r) : 0;

  const advance = useCallback(
    (user: boolean) => {
      if (!item) return;
      if (beat < n - 1) return setBeat((b) => b + 1);
      markDone(item.r.id);
      if (user || S.autoNext) {
        if (cur < list.length - 1) goTo(cur + 1);
        else if (user) say("That was the last reel");
      }
    },
    [item, beat, n, cur, list.length, S.autoNext, goTo, markDone]
  );

  const back = useCallback(() => {
    if (beat > 0) setBeat((b) => b - 1);
    else if (cur > 0) goTo(cur - 1);
    else {
      startAt.current = performance.now();
      setP(0);
    }
  }, [beat, cur, goTo]);

  // Playback clock.
  useEffect(() => {
    if (!item || paused) return;
    let raf = 0;
    const dur = durationOf(item.r, beat) / (S.speed || 1);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const prog = Math.min(1, (now - startAt.current) / dur);
      setP(prog);
      if (prog >= 1 && !beatDone.current) {
        beatDone.current = true;
        if (beat === n - 1) markDone(item.r.id);
        if (S.autoBeats) advance(false);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [item, beat, paused, n, S.speed, S.autoBeats, advance, markDone]);

  const togglePause = useCallback(() => {
    setPaused((was) => {
      if (was) startAt.current += performance.now() - pausedAt.current;
      else pausedAt.current = performance.now();
      return !was;
    });
  }, []);

  const act = useCallback(
    (what: "like" | "save" | "share" | "cta", r: Reel) => {
      if (what === "like") update((s) => ({ ...s, likes: { ...s.likes, [r.id]: !s.likes[r.id] } }));
      if (what === "save") {
        update((s) => ({ ...s, saves: { ...s.saves, [r.id]: !s.saves[r.id] } }));
        say(store.saves[r.id] ? "Removed from saved" : "Saved");
      }
      if (what === "share") {
        const url = `${location.origin}/reels/${list.find((x) => x.r.id === r.id)?.c.id ?? ""}`;
        navigator.clipboard?.writeText(url).then(() => say("Link copied"));
      }
      if (what === "cta" && r.cta) router.push(routeFor(r.cta.post, r.cta.section));
    },
    [update, store.saves, list, router]
  );

  // Keyboard.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.metaKey || e.ctrlKey) return;
      if (e.key === "ArrowDown" || e.key === "j") (e.preventDefault(), goTo(Math.min(list.length - 1, cur + 1)));
      else if (e.key === "ArrowUp" || e.key === "k") (e.preventDefault(), goTo(Math.max(0, cur - 1)));
      else if (e.key === "ArrowRight") advance(true);
      else if (e.key === "ArrowLeft") back();
      else if (e.key === " ") (e.preventDefault(), togglePause());
      else if (e.key.toLowerCase() === "l" && item) act("like", item.r);
      else if (e.key.toLowerCase() === "s" && item) act("save", item.r);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [cur, list.length, item, goTo, advance, back, togglePause, act]);

  // Stable handlers so idle reels never re-render while the active one animates.
  const latest = useRef<Handlers>(null!);
  latest.current = {
    back,
    next: () => advance(true),
    pause: togglePause,
    act,
    pick: (id, v) => {
      setPicks((s) => ({ ...s, [id]: v }));
      if (list[cur]?.r.id === id && beat === 0) setBeat(1);
    },
  };
  const stable = useMemo<Handlers>(
    () => ({
      back: () => latest.current.back(),
      next: () => latest.current.next(),
      pause: () => latest.current.pause(),
      act: (w, r) => latest.current.act(w, r),
      pick: (id, v) => latest.current.pick(id, v),
    }),
    []
  );

  const learn = summaries.filter((c) => c.group === "learn");
  const quick = summaries.filter((c) => c.group === "quick");
  const doneIn = (c: CollectionSummary) => c.ids.filter((id) => store.done[id]).length;
  const colBtn = (c: CollectionSummary) => (
    <Link key={c.id} href={`/reels/${c.id}`} className="colbtn" aria-current={filter === c.id ? "page" : undefined} style={{ "--sw": c.theme.accent } as CSSProperties}>
      <span className="sw" />
      <span>{c.title}</span>
      <small>
        {hydrated ? doneIn(c) : 0}/{c.ids.length}
      </small>
    </Link>
  );
  const totalLearn = learn.reduce((a, c) => a + c.ids.length, 0);
  const doneLearn = learn.reduce((a, c) => a + doneIn(c), 0);

  return (
    <main className="view view-reels-page" id="view-reels">
      <div className="rv-mobile">
        <label htmlFor="rv-sel" className="vh">
          Collection
        </label>
        <select id="rv-sel" value={filter} onChange={(e) => router.push(e.target.value === "all" ? "/reels" : `/reels/${e.target.value}`)}>
          <option value="all">All reels</option>
          {summaries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.ids.length})
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setSettingsOpen(true)}>
          Settings
        </button>
      </div>
      <div className="rv">
        <aside className="rv-side" aria-label="Reel collections">
          <h2>Reels</h2>
          <p className="sm">
            {learn.length} courses: interview rounds, the AI handbook, the mobile internals and more. One readable page per step. Scroll or swipe
            for the next one. Tap the right or left side to step, the middle to pause.
          </p>
          <div className="cols">
            <Link href="/reels" className="colbtn" aria-current={filter === "all" ? "page" : undefined} style={{ "--sw": "#eef2f7" } as CSSProperties}>
              <span className="sw" />
              <span>All reels</span>
              <small>{summaries.reduce((a, c) => a + c.ids.length, 0)}</small>
            </Link>
            <div className="grp">
              <span>Courses</span>
              <span>
                {hydrated ? doneLearn : 0}/{totalLearn}
              </span>
            </div>
            <div className="meter">
              <i style={{ width: `${totalLearn ? (100 * (hydrated ? doneLearn : 0)) / totalLearn : 0}%` }} />
            </div>
            {learn.map(colBtn)}
            <div className="grp">
              <span>Quick hits</span>
            </div>
            {quick.map(colBtn)}
          </div>
          <div className="rv-tools">
            <button type="button" onClick={() => setSettingsOpen(true)}>
              Settings
            </button>
          </div>
          <div className="keys">
            <kbd>↑</kbd> <kbd>↓</kbd> previous / next reel
            <br />
            <kbd>←</kbd> <kbd>→</kbd> step inside a reel
            <br />
            <kbd>space</kbd> pause · <kbd>L</kbd> like · <kbd>S</kbd> save
          </div>
        </aside>

        <div className={`rstage size-${S.size}` + (S.captions ? "" : " nocap")}>
          <div className="feed" ref={feed} aria-label="Reels feed">
            {list.map((x, i) => (
              <ReelCard
                key={x.c.id + x.r.id}
                x={x}
                i={i}
                total={list.length}
                active={i === cur}
                near={Math.abs(i - cur) <= 2}
                beat={i === cur ? beat : 0}
                p={i === cur ? p : 0}
                paused={i === cur && paused}
                liked={!!store.likes[x.r.id]}
                saved={!!store.saves[x.r.id]}
                pick={picks[x.r.id]}
                h={stable}
              />
            ))}
          </div>
        </div>

        <aside className="rv-side" aria-label="Up next">
          <h4 className="un-h">
            <span>Up next</span>
            <span>
              {cur + 1} / {list.length}
            </span>
          </h4>
          <UpNext list={list} cur={cur} done={store.done} onGo={goTo} />
        </aside>
      </div>

      {settingsOpen && (
        <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="ds-h" onMouseDown={(e) => e.target === e.currentTarget && setSettingsOpen(false)}>
          <div className="dpanel">
            <header>
              <h3 id="ds-h">Reel settings</h3>
              <button type="button" className="x" onClick={() => setSettingsOpen(false)}>
                Close
              </button>
            </header>
            <p>Saved in this browser only.</p>
            {(
              [
                ["autoBeats", "Auto-play steps", "Each reel moves through its steps on its own."],
                ["autoNext", "Auto-advance", "Go to the next reel when one ends."],
                ["captions", "Captions", "The line under each reel's title."],
              ] as const
            ).map(([k, t, d]) => (
              <label className="setrow" key={k}>
                <span>
                  {t}
                  <small>{d}</small>
                </span>
                <input type="checkbox" checked={S[k]} onChange={(e) => update((s) => ({ ...s, settings: { ...S, [k]: e.target.checked } }))} />
              </label>
            ))}
            <label className="setrow">
              <span>Speed</span>
              <select value={S.speed} onChange={(e) => update((s) => ({ ...s, settings: { ...S, speed: +e.target.value } }))}>
                {[0.75, 1, 1.25, 1.5, 2].map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </label>
            <label className="setrow">
              <span>Text size</span>
              <select value={S.size} onChange={(e) => update((s) => ({ ...s, settings: { ...S, size: e.target.value as "s" | "m" | "l" } }))}>
                <option value="s">Small</option>
                <option value="m">Medium</option>
                <option value="l">Large</option>
              </select>
            </label>
          </div>
        </div>
      )}
      <div className={"toast" + (toast ? " on" : "")} role="status">
        {toast}
      </div>
    </main>
  );
}

const UpNext = memo(function UpNext({ list, cur, done, onGo }: { list: Item[]; cur: number; done: Record<string, boolean>; onGo: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector(".on")?.scrollIntoView({ block: "nearest" });
  }, [cur]);
  return (
    <div className="un" ref={ref}>
      {list.map((x, i) => (
        <button key={x.c.id + x.r.id} type="button" className={(i === cur ? "on" : "") + (done[x.r.id] ? " done" : "")} onClick={() => onGo(i)}>
          <i>{String(i + 1).padStart(2, "0")}</i>
          <span>
            {x.r.title}
            <span className="c" style={{ "--sw": x.c.theme.accent } as CSSProperties}>
              <b />
              {x.c.title}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
});

interface Handlers {
  back: () => void;
  next: () => void;
  pause: () => void;
  act: (what: "like" | "save" | "share" | "cta", r: Reel) => void;
  pick: (id: string, v: number) => void;
}

interface CardProps {
  x: Item;
  i: number;
  total: number;
  active: boolean;
  beat: number;
  p: number;
  paused: boolean;
  liked: boolean;
  saved: boolean;
  pick?: number;
  near: boolean;
  h: Handlers;
}

/** Quick-hit reels: shrink (or gently grow) the slide so it always fits the space above the caption. */
function FitBody({ children, watch }: { children: ReactNode; watch: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current;
    const el = inner.current;
    if (!o || !el) return;
    const run = () => {
      const cs = getComputedStyle(o);
      const have = o.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (have <= 0) return;
      let z = 1;
      el.style.setProperty("zoom", "1");
      for (let pass = 0; pass < 4; pass++) {
        const need = el.getBoundingClientRect().height;
        const next = Math.min(1.45, Math.max(0.5, z * ((have * 0.97) / need)));
        if (Math.abs(next - z) < 0.01) break;
        z = next;
        el.style.setProperty("zoom", String(z));
      }
      // Text rewraps as it scales, so make sure the last step never overflows.
      const after = el.getBoundingClientRect().height;
      if (after > have) el.style.setProperty("zoom", String(Math.max(0.5, (z * have * 0.97) / after)));
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(o);
    ro.observe(el);
    document.fonts?.ready.then(run);
    return () => ro.disconnect();
  }, [watch]);
  return (
    <div className="r-body" ref={outer}>
      <div className="r-fit" ref={inner}>
        {children}
      </div>
    </div>
  );
}

const ReelCard = memo(function ReelCard({ x, i, total, active, beat, p, paused, liked, saved, pick, near, h }: CardProps) {
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
