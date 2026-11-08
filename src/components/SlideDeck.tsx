"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface DeckSlide {
  src: string;
  alt: string;
  caption: string;
  flag?: string;
}

/** One slide at a time, with arrows, swipe, keys, thumbnails and full screen. */
export function SlideDeck({ slides }: { slides: DeckSlide[] }) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const n = slides.length;
  const go = useCallback((to: number) => setI(Math.max(0, Math.min(n - 1, to))), [n]);

  // Load the neighbours ahead of time, so moving on feels instant.
  useEffect(() => {
    for (const k of [i - 1, i + 1]) if (slides[k]) new Image().src = slides[k].src;
  }, [i, slides]);

  useEffect(() => {
    box.current?.querySelector<HTMLElement>(".sd-thumb[aria-current='true']")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [i]);

  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(n - 1);
    else return;
    e.preventDefault();
  };

  const full = () => {
    const el = box.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  const s = slides[i];
  return (
    <div className="sd" ref={box} role="region" aria-roledescription="carousel" aria-label="Slides" tabIndex={0} onKeyDown={key}>
      <div
        className="sd-stage"
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s0 = start.current;
          start.current = null;
          if (!s0) return;
          const dx = e.clientX - s0.x;
          // A mostly horizontal drag changes slide. A mostly vertical one is the page scrolling.
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s0.y) * 1.5) go(i + (dx < 0 ? 1 : -1));
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={s.src} src={s.src} alt={s.alt} width={1280} height={720} decoding="async" draggable={false} />
        <button type="button" className="sd-nav sd-prev" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous slide">
          ‹
        </button>
        <button type="button" className="sd-nav sd-next" onClick={() => go(i + 1)} disabled={i === n - 1} aria-label="Next slide">
          ›
        </button>
      </div>
      <div className="sd-bar">
        <span className="sd-count" aria-live="polite">
          {i + 1} / {n}
        </span>
        <div className="sd-tools">
          <a href={s.src} target="_blank" rel="noopener noreferrer">
            Full size
          </a>
          <button type="button" onClick={full}>
            Full screen
          </button>
        </div>
      </div>
      <p className="sd-cap" aria-live="polite">
        {s.caption}
        {s.flag && <span className="rs-flag">{s.flag}</span>}
      </p>
      <ol className="sr-only">
        {slides.map((t) => (
          <li key={t.src}>{t.caption}</li>
        ))}
      </ol>
      <div className="sd-thumbs" role="tablist" aria-label="Choose a slide">
        {slides.map((t, k) => (
          <button key={t.src} type="button" role="tab" className="sd-thumb" aria-current={k === i} aria-selected={k === i} aria-label={`Slide ${k + 1}: ${t.caption}`} onClick={() => go(k)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.src} alt="" width={160} height={90} loading="lazy" decoding="async" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
