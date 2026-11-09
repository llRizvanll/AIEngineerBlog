"use client";

import { UI_EVENTS } from "@/lib/ui-events";
import { SearchIcon } from "./SearchIcon";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/lib/search";
import { SEARCH_KIND_ORDER } from "@/config/constants";

function score(item: SearchItem, terms: string[]): number {
  const t = item.title.toLowerCase(),
    s = item.summary.toLowerCase(),
    k = item.keywords.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (t.startsWith(term)) total += 6;
    else if (t.includes(term)) total += 4;
    else if (k.includes(term)) total += 2;
    else if (s.includes(term)) total += 1;
    else return 0;
  }
  return total;
}

let indexPromise: Promise<SearchItem[]> | null = null;
/** Fetch the search index once per session; the browser and CDN cache it too. */
function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => r.json() as Promise<SearchItem[]>)
    .catch(() => {
      indexPromise = null;
      return [];
    });
  return indexPromise;
}

export function SearchPalette() {
  const [items, setItems] = useState<SearchItem[]>([]);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  // Warm the index when the browser is idle, so the first search is instant.
  useEffect(() => {
    const warm = () => loadIndex().then(setItems);
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(warm);
    else setTimeout(warm, 1500);
  }, []);

  useEffect(() => {
    const show = () => setOpen(true);
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(UI_EVENTS.search, show);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener(UI_EVENTS.search, show);
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (open) {
      if (!items.length) loadIndex().then(setItems);
      setSel(0);
      setTimeout(() => input.current?.focus(), 10);
      document.body.style.overflow = "hidden";
    } else document.body.style.overflow = "";
  }, [open]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return items.filter((i) => i.kind === "Page" || i.kind === "Post");
    return items
      .map((i) => ({ i, s: score(i, terms) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((x) => x.i);
  }, [q, items]);

  const grouped = useMemo(() => {
    const g = SEARCH_KIND_ORDER.map((k) => ({ k, items: results.filter((r) => r.kind === k) })).filter((x) => x.items.length);
    return g;
  }, [results]);
  const flat = grouped.flatMap((g) => g.items);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    list.current?.querySelector(".sr.on")?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const go = (item?: SearchItem) => {
    if (!item) return;
    setOpen(false);
    setQ("");
    router.push(item.href);
  };

  if (!open) return null;
  return (
    <div className="sp-ov on" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="sp-box" role="dialog" aria-modal="true" aria-label="Search">
        <div className="sp-in">
          <SearchIcon size={18} />
          <input
            ref={input}
            autoFocus
            value={q}
            placeholder="Search posts, rounds, protocols, concepts…"
            aria-label="Search"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(flat.length - 1, s + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              } else if (e.key === "Enter") go(flat[sel]);
              else if (e.key === "Escape") setOpen(false);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="sp-list" ref={list}>
          {!flat.length && <div className="sr-empty">Nothing matches “{q}”.</div>}
          {grouped.map((g) => (
            <div key={g.k}>
              <div className="sr-h">{g.k === "Term" ? "Glossary" : g.k === "Behavioral" ? "Behavioral questions" : g.k === "Mobile" ? "Mobile machine coding" : g.k + "s"}</div>
              {g.items.map((it) => {
                const idx = flat.indexOf(it);
                return (
                  <a
                    key={it.href + it.title}
                    href={it.href}
                    className={"sr" + (idx === sel ? " on" : "")}
                    onMouseEnter={() => setSel(idx)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(it);
                    }}
                  >
                    <span className={"kd kd-" + it.kind.replace(/\s/g, "")}>{it.kind}</span>
                    <span className="tx">
                      <b>{it.title}</b>
                      <small>{it.summary}</small>
                    </span>
                    <span className="m">↵</span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
        <div className="sp-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>⌘K</kbd> or <kbd>/</kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
