"use client";

import Link from "next/link";
import { emptyLibrary, LIBRARY_KEY, useLocal, type LibraryState } from "@/lib/store";
import { KEEP_READING_COPY } from "@/content/ui-copy";

export function KeepReading() {
  const [lib, , hydrated] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  if (!hydrated) return null;
  const items = Object.entries(lib.seen)
    .filter(([, v]) => (v.pct ?? 0) < 95)
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, 3);
  if (!items.length) return null;
  return (
    <>
      <div className="section-h">
        <div>
          <span className="eyebrow">{KEEP_READING_COPY.eyebrow}</span>
          <h2>{KEEP_READING_COPY.title}</h2>
        </div>
        <Link href="/library" className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          My library →
        </Link>
      </div>
      <div className="rd-up-g stagger">
        {items.map(([href, v]) => (
          <Link key={href} href={href} className="rd-up-a hm-c">
            <span className={"kd kd-" + v.kind.replace(/\s/g, "")}>{v.kind}</span>
            <b>{v.title}</b>
            <span className="lib-bar">
              <i style={{ width: `${v.pct ?? 0}%` }} />
            </span>
            <span className="m">{v.pct ?? 0}% read</span>
          </Link>
        ))}
      </div>
    </>
  );
}
