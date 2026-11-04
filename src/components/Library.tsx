"use client";

import Link from "next/link";
import { emptyLibrary, LIBRARY_KEY, useLocal, type LibraryState } from "@/lib/store";

const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
};

export function Library() {
  const [lib, update, hydrated] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  if (!hydrated) return null;
  const saved = Object.entries(lib.saved).sort((a, b) => b[1].at - a[1].at);
  const seen = Object.entries(lib.seen).sort((a, b) => b[1].at - a[1].at);
  const finished = seen.filter(([, v]) => (v.pct ?? 0) >= 95).length;
  return (
    <>
      <div className="lib-stats stagger">
        <div>
          <b>{saved.length}</b>
          <span>saved</span>
        </div>
        <div>
          <b>{seen.length}</b>
          <span>opened</span>
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
      <div className="section-h">
        <h2>Saved</h2>
        <span>press b on any page to save it</span>
      </div>
      {saved.length ? (
        <div className="lib-g stagger">
          {saved.map(([href, v]) => (
            <div key={href} className="lib-c">
              <span className={"kd kd-" + v.kind.replace(/\s/g, "")}>{v.kind}</span>
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
        <div className="empty-card">Nothing saved yet. Use ☆ Save in the contents rail of any article.</div>
      )}
      <div className="section-h">
        <h2>Reading history</h2>
        <span>{seen.length} pages</span>
      </div>
      {seen.length ? (
        <div className="lib-g stagger">
          {seen.map(([href, v]) => (
            <Link key={href} href={href} className="lib-c">
              <span className={"kd kd-" + v.kind.replace(/\s/g, "")}>{v.kind}</span>
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
        <div className="empty-card">Open a post, round or deep dive and it shows up here.</div>
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
