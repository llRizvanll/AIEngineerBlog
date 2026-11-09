"use client";

import Link from "next/link";
import { useState } from "react";
import { emptyLibrary, LIBRARY_KEY, useLocal, type LibraryState } from "@/lib/store";
import { LIBRARY_COPY } from "@/content/ui-copy";

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
};

const KIND_CLASS = (k: string) => "kd kd-" + k.replace(/\s/g, "");

/** Seek: saved pages and history. Sense: your notes. Share: export them. */
export function Library() {
  const [lib, update, hydrated] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  const [copied, setCopied] = useState(false);
  if (!hydrated) return null;
  const saved = Object.entries(lib.saved).sort((a, b) => b[1].at - a[1].at);
  const seen = Object.entries(lib.seen).sort((a, b) => b[1].at - a[1].at);
  const notes = Object.entries(lib.notes ?? {}).sort((a, b) => b[1].at - a[1].at);
  const finished = seen.filter(([, v]) => (v.pct ?? 0) >= 95).length;

  const markdown = () =>
    [`# My notes from AI Engineer`, ...notes.map(([href, n]) => `\n## ${n.title}\n${window.location.origin}${href}\n\n${n.text}`)].join("\n");
  const copyNotes = async () => {
    await navigator.clipboard.writeText(markdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const downloadNotes = () => {
    const url = URL.createObjectURL(new Blob([markdown()], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-engineer-notes.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="lib-stats stagger">
        <div>
          <b>{saved.length}</b>
          <span>saved</span>
        </div>
        <div>
          <b>{notes.length}</b>
          <span>notes</span>
        </div>
        <div>
          <b>{finished}</b>
          <span>finished</span>
        </div>
        <div>
          <b>{seen.length ? Math.round(seen.reduce((a, [, v]) => a + (v.pct ?? 0), 0) / seen.length) : 0}%</b>
          <span>average progress</span>
        </div>
      </div>

      <div className="section-h" id="seek">
        <h2>{LIBRARY_COPY.savedTitle}</h2>
        <span>tap ☆ Save while reading</span>
      </div>
      {saved.length ? (
        <div className="lib-g stagger">
          {saved.map(([href, v]) => (
            <div key={href} className="lib-c">
              <span className={KIND_CLASS(v.kind)}>{v.kind}</span>
              <Link href={href}>
                <b>{v.title}</b>
              </Link>
              <span className="m">saved {ago(v.at)}</span>
              <button
                type="button"
                className="lib-btn"
                onClick={() =>
                  update((l) => {
                    const s = { ...l.saved };
                    delete s[href];
                    return { ...l, saved: s };
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-card">{LIBRARY_COPY.savedEmpty}</div>
      )}

      <div className="section-h" id="sense">
        <h2>{LIBRARY_COPY.notesTitle}</h2>
        <span>tap ✎ Note while reading</span>
      </div>
      {notes.length ? (
        <div className="lib-notes">
          {notes.map(([href, n]) => (
            <div key={href} className="lib-note">
              <div className="ln-head">
                <span className={KIND_CLASS(n.kind)}>{n.kind}</span>
                <Link href={href}>
                  <b>{n.title}</b>
                </Link>
                <span className="m">{ago(n.at)}</span>
              </div>
              <textarea
                aria-label={`Note on ${n.title}`}
                rows={3}
                value={n.text}
                onChange={(e) => {
                  const text = e.target.value;
                  update((l) => {
                    const next = { ...l.notes };
                    if (text) next[href] = { ...n, text, at: Date.now() };
                    else delete next[href];
                    return { ...l, notes: next };
                  });
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-card">{LIBRARY_COPY.notesEmpty}</div>
      )}

      <div className="section-h" id="share">
        <h2>Share: export</h2>
        <span>as Markdown, with links back</span>
      </div>
      <div className="lib-share">
        <button type="button" className="btn ghost" disabled={!notes.length} onClick={copyNotes}>
          {copied ? "Copied" : "Copy notes"}
        </button>
        <button type="button" className="btn ghost" disabled={!notes.length} onClick={downloadNotes}>
          Download .md
        </button>
      </div>

      <div className="section-h">
        <h2>{LIBRARY_COPY.historyTitle}</h2>
        <span>{seen.length} pages</span>
      </div>
      {seen.length ? (
        <div className="lib-g stagger">
          {seen.map(([href, v]) => (
            <Link key={href} href={href} className="lib-c">
              <span className={KIND_CLASS(v.kind)}>{v.kind}</span>
              <b>{v.title}</b>
              <span className="lib-bar">
                <i style={{ width: `${v.pct ?? 0}%` }} />
              </span>
              <span className="m">
                {v.pct ?? 0}% · {ago(v.at)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-card">{LIBRARY_COPY.historyEmpty}</div>
      )}
      {seen.length > 0 && (
        <p style={{ marginTop: 24 }}>
          <button type="button" className="lib-btn warn" onClick={() => update(() => emptyLibrary)}>
            Clear library
          </button>
        </p>
      )}
    </>
  );
}
