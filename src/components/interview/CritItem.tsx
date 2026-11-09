"use client";

import type { CriticalQ } from "@/content/types";
import { critKey } from "@/lib/routes";
import { emptyInterview, INTERVIEW_KEY, useLocal, type InterviewState } from "@/lib/store";
import { SECTION_NAME } from "@/content/ui-copy";

export function CritItem({ caseId, index, q, showSection }: { caseId: string; index: number; q: CriticalQ; showSection?: boolean }) {
  const [st, update] = useLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
  const k = critKey(caseId, q[0], index);
  const done = !!st.crit[k];
  return (
    <details className={"cq" + (done ? " done" : "")}>
      <summary>
        <span className={`k k-${q[1]}`}>{q[1]}</span>
        <span>
          {q[2]}
          {showSection && <span className="c"> · {SECTION_NAME[q[0]] || q[0]}</span>}
        </span>
      </summary>
      <div className="a">{q[3]}</div>
      <label className="got">
        <input type="checkbox" checked={done} onChange={(e) => update((s) => ({ ...s, crit: { ...s.crit, [k]: e.target.checked } }))} /> I can
        answer this
      </label>
    </details>
  );
}
