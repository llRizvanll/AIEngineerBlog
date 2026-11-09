"use client";

import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { emptyLibrary, LIBRARY_KEY, useLocal, type LibraryState } from "@/lib/store";
import { READING_COPY } from "@/content/ui-copy";

interface Props {
  title: string;
  kind: string;
  articleId?: string;
  articleClass?: string;
  railTitle?: string;
  /** Pre-rendered article HTML (used by the hand-written Part 1). */
  html?: string;
  children?: ReactNode;
}

/**
 * Two-column reading layout: the article plus a sticky contents rail with scroll-spy.
 * Also records the page in the reader's library, offers save + focus mode, and fades sections in.
 */
export function Reading({ title, kind, articleId = "article", articleClass, railTitle = "On this page", html, children }: Props) {
  const path = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [toc, setToc] = useState<{ id: string; label: string; part?: boolean }[]>([]);
  const [cur, setCur] = useState<string>("");
  const [focus, setFocus] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setSheet(false), [path]);
  const [lib, updateLib, hydrated] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  const saved = !!lib.saved[path];

  // Build the rail from the rendered sections.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const secs = Array.from(el.querySelectorAll<HTMLElement>(":scope > section[data-toc]"));
    // Part headers (basics, the question, …) become group labels in the rail.
    const items = Array.from(el.querySelectorAll<HTMLElement>(":scope > section[data-toc], :scope > .part[data-part-head]"));
    setToc(items.map((s) => (s.dataset.partHead ? { id: s.id, label: s.dataset.partHead, part: true } : { id: s.id, label: s.dataset.toc || "" })));

    // Fade sections in as they enter the viewport.
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px" }
    );
    secs.forEach((s) => {
      s.classList.add("fx-reveal");
      io.observe(s);
    });

    let raf = 0;
    const spy = () => {
      raf = 0;
      let c = secs[0]?.id ?? "";
      for (const s of secs) {
        if (s.getBoundingClientRect().top < 140) c = s.id;
        else break;
      }
      setCur(c);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(spy);
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Jump to a hash on arrival.
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        // Level 2 material stays collapsed until something links straight to it.
        target.closest("details")?.setAttribute("open", "");
        target.querySelector("details.lvl2")?.setAttribute("open", "");
        setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 60);
      }
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [path]);

  // Remember what the reader opened, and how far they got.
  useEffect(() => {
    if (!hydrated) return;
    updateLib((l) => ({ ...l, seen: { ...l.seen, [path]: { title, kind, at: Date.now(), pct: l.seen[path]?.pct ?? 0 } } }));
    const el = ref.current;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const pct = Math.round(100 * Math.min(1, Math.max(0, -r.top / Math.max(1, el.offsetHeight - window.innerHeight))));
        updateLib((l) => {
          const prev = l.seen[path];
          if (!prev || pct <= (prev.pct ?? 0)) return l;
          return { ...l, seen: { ...l.seen, [path]: { ...prev, pct } } };
        });
      }, 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, path]);

  useEffect(() => {
    document.body.classList.toggle("rd-focus", focus);
    return () => document.body.classList.remove("rd-focus");
  }, [focus]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      if (e.key === "f") setFocus((f) => !f);
      if (e.key === "b") toggleSave();
      if (e.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const note = lib.notes?.[path]?.text ?? "";
  const setNote = (text: string) =>
    updateLib((l) => {
      const notes = { ...l.notes };
      if (text) notes[path] = { title, kind, text, at: Date.now() };
      else delete notes[path];
      return { ...l, notes };
    });
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setToast("Link copied");
        setTimeout(() => setToast(""), 1600);
      }
    } catch {
      /* the reader closed the share sheet */
    }
  };

  const toggleSave = () =>
    updateLib((l) => {
      const s = { ...l.saved };
      if (s[path]) delete s[path];
      else s[path] = { title, kind, at: Date.now() };
      return { ...l, saved: s };
    });

  return (
    <div className="layout">
      {html !== undefined ? (
        <article id={articleId} className={articleClass} ref={ref} data-reading dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <article id={articleId} className={articleClass} ref={ref} data-reading>
          {children}
        </article>
      )}
      <aside className="rail" aria-label="Contents">
        <h4>{railTitle}</h4>
        <div>
          {toc.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.part ? "rail-part" : t.id === cur ? "on" : undefined}
              onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth" })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="rail-act">
          <button type="button" onClick={toggleSave} aria-pressed={saved} title="Save to library (b)">
            {saved ? "★ Saved" : "☆ Save"}
          </button>
          <button type="button" onClick={() => setNoteOpen(true)} aria-pressed={!!note} title="Add your own note">
            ✎ Note
          </button>
          <button type="button" onClick={share} title="Share this page">
            ↗ Share
          </button>
          <button type="button" onClick={() => setFocus((f) => !f)} aria-pressed={focus} title="Focus mode (f)">
            ◐ Focus
          </button>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
            ↑ Top
          </button>
        </div>
      </aside>
      {/* Small screens hide the rail: this dock gives them contents, save and back-to-top. */}
      <div className="rd-dock" role="toolbar" aria-label="Reading">
        {toc.length > 0 && (
          <button type="button" onClick={() => setSheet(true)} aria-haspopup="dialog">
            <span aria-hidden>☰</span> Contents
          </button>
        )}
        <button type="button" onClick={toggleSave} aria-pressed={saved}>
          {saved ? "★ Saved" : "☆ Save"}
        </button>
        <button type="button" onClick={() => setNoteOpen(true)} aria-pressed={!!note} aria-label="Add your own note">
          ✎
        </button>
        <button type="button" onClick={share} aria-label="Share this page">
          ↗
        </button>
        <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑
        </button>
      </div>
      {mounted &&
        sheet &&
        createPortal(
          <div className="rd-sheet-ov" onMouseDown={(e) => e.target === e.currentTarget && setSheet(false)}>
            <div className="rd-sheet" role="dialog" aria-modal="true" aria-label={railTitle}>
              <div className="rd-sheet-h">
                <b>{railTitle}</b>
                <button type="button" onClick={() => setSheet(false)} aria-label="Close contents">
                  ✕
                </button>
              </div>
              <div className="rd-sheet-list">
                {toc.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={t.part ? "rail-part" : t.id === cur ? "on" : undefined}
                    onClick={() => {
                      setSheet(false);
                      document.getElementById(t.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      {mounted &&
        noteOpen &&
        createPortal(
          <div className="rd-sheet-ov" onMouseDown={(e) => e.target === e.currentTarget && setNoteOpen(false)}>
            <div className="rd-sheet" role="dialog" aria-modal="true" aria-label="Your note">
              <div className="rd-sheet-h">
                <b>Your note</b>
                <button type="button" onClick={() => setNoteOpen(false)} aria-label="Close note">
                  ✕
                </button>
              </div>
              <textarea className="rd-note" rows={7} autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder={READING_COPY.notePlaceholder} />
              <p className="rd-note-hint">{READING_COPY.noteHint}</p>
            </div>
          </div>,
          document.body
        )}
      {toast && <div className="rd-toast2" role="status">{toast}</div>}
      {focus && (
        <button type="button" className="focus-exit" onClick={() => setFocus(false)}>
          Exit focus <kbd>esc</kbd>
        </button>
      )}
    </div>
  );
}
