"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Reel, ReelCollection } from "@/content/types";
import { routeFor } from "@/lib/routes";
import type { CollectionSummary } from "@/lib/reel-summary";
import { useLocal } from "@/lib/store";
import { beatsOf, durationOf } from "./templates";
import { EMPTY_REEL_STORE, REELS_STORE_KEY } from "./store";
import { ReelCard } from "./ReelCard";
import { UpNext } from "./UpNext";
import type { Handlers, Item, ReelStore } from "./types";

export function ReelsPlayer({ collections, summaries, filter }: { collections: ReelCollection[]; summaries: CollectionSummary[]; filter: string }) {
  const router = useRouter();
  const [store, update, hydrated] = useLocal<ReelStore>(REELS_STORE_KEY, EMPTY_REEL_STORE);
  const S = { ...EMPTY_REEL_STORE.settings, ...store.settings };
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

  // Deep link: /reels/collection?r=reel-id opens that reel.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("r");
    if (!id) return;
    const i = list.findIndex((x) => x.r.id === id);
    if (i < 0) return;
    // A timeout rather than requestAnimationFrame: it also runs in a background tab.
    const t = setTimeout(() => {
      const root = feed.current;
      const el = root?.querySelector<HTMLElement>(`.reel[data-i="${i}"]`);
      if (root && el) root.scrollTop = el.offsetTop;
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    let shown = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const prog = Math.min(1, (now - startAt.current) / dur);
      // Re-render only when progress moves a visible amount, not on every frame.
      if (prog >= 1 || prog - shown >= 0.012) {
        shown = prog;
        setP(prog);
      }
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
