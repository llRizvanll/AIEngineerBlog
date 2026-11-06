/* "The bot feels dumb." Turn that complaint into one failed stage, by reading the trace in order. */
export interface Trace {
  neededDocs: string[];
  retrievedDocs: string[];
  citedDocs: string[];
  toolErrors: string[];
  answerUsedNeededDoc: boolean;
  latencyMs: number;
}

export type Finding = "tool-failed" | "retrieval-missed" | "made-up-citation" | "context-ignored" | "too-slow" | "no-fault-found";

// region: diagnose
/** The order matters: an early failure explains the later ones, so report the first one you find. */
export function diagnose(t: Trace, latencyLimitMs: number): Finding {
  if (t.toolErrors.length > 0) return "tool-failed";
  if (!t.neededDocs.some((d) => t.retrievedDocs.includes(d))) return "retrieval-missed";
  if (t.citedDocs.some((d) => !t.retrievedDocs.includes(d))) return "made-up-citation";
  if (!t.answerUsedNeededDoc) return "context-ignored";
  if (t.latencyMs > latencyLimitMs) return "too-slow";
  return "no-fault-found";
}
// endregion

// region: count
/** One complaint is a story. Counting findings across traces tells you what to fix first. */
export function rankFindings(traces: Trace[], latencyLimitMs: number): [Finding, number][] {
  const counts = new Map<Finding, number>();
  for (const t of traces) {
    const f = diagnose(t, latencyLimitMs);
    counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
// endregion
