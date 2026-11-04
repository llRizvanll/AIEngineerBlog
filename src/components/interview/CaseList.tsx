"use client";

import Link from "next/link";
import { useState } from "react";
import { emptyInterview, INTERVIEW_KEY, useLocal, type InterviewState } from "@/lib/store";

interface Item { id: string; track: string; minutes: number; title: string; prompt: string; tags: string[] }

export function CaseList({ cases }: { cases: Item[] }) {
  const [track, setTrack] = useState("All");
  const [st] = useLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
  const shown = cases.filter((c) => track === "All" || c.track === track);
  return (
    <>
      <div className="section-h">
        <h2>Choose a round</h2>
        <div className="chips" role="group" aria-label="Filter rounds">
          {["All", "Mobile", "AI"].map((t) => (
            <button key={t} type="button" aria-pressed={t === track} onClick={() => setTrack(t)}>
              {t}
              {t === "All" ? "" : ` (${cases.filter((c) => c.track === t).length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="iv-grid stagger" key={track}>
        {shown.map((c) => (
          <Link key={c.id} className="iv-card" href={`/interview/${c.id}`}>
            <div className="iv-top">
              <span className={"pill " + (c.track === "AI" ? "ai" : "")}>{c.track}</span>
              <span className="mono">
                {c.minutes} min round{st.done[c.id] ? " · practised ✓" : ""}
              </span>
            </div>
            <h3>{c.title}</h3>
            <p>“{c.prompt.length > 190 ? c.prompt.slice(0, 187) + "…" : c.prompt}”</p>
            <div className="iv-tags">
              {c.tags.map((t) => (
                <span key={t}>#{t}</span>
              ))}
            </div>
            <span className="iv-go">Start the round →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
