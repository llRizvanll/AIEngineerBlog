"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InterviewCase } from "@/content/types";

/** Rotates daily. Rendered on the client so a static build never freezes the date. */
export function TodayQuestion({ cases }: { cases: Pick<InterviewCase, "id" | "track" | "minutes" | "prompt" | "title">[] }) {
  const [c, setC] = useState(cases[0]);
  useEffect(() => setC(cases[Math.floor(Date.now() / 86400000) % cases.length]), [cases]);
  return (
    <div className="today">
      <div className="today-top">
        <span className="today-dot" />
        <span>Today’s interview question</span>
        <span className="today-meta">
          {c.track} · {c.minutes} min
        </span>
      </div>
      <h3>{c.title}</h3>
      <p>“{c.prompt}”</p>
      <Link className="btn" href={`/interview/${c.id}`}>
        Take this round →
      </Link>
    </div>
  );
}
