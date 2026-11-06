/* Every miss gets written down with a cause, so tomorrow's practice targets it. */
export interface Miss {
  at: number;
  topic: string;
  /** what actually went wrong: "off by one", "didn't test empty input" */
  cause: string;
  question: string;
  answer: string;
}

const DAY = 86_400_000;

// region: weakest
/** Recent misses count more: a miss loses half its weight every 7 days. */
export function weakestTopics(misses: Miss[], now: number, halfLifeDays = 7): [string, number][] {
  const weight = new Map<string, number>();
  for (const m of misses) {
    const ageDays = Math.max(0, now - m.at) / DAY;
    weight.set(m.topic, (weight.get(m.topic) ?? 0) + 0.5 ** (ageDays / halfLifeDays));
  }
  return [...weight].map(([t, w]): [string, number] => [t, Math.round(w * 100) / 100]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** If the same cause keeps coming back, that habit is worth more than any single topic. */
export function repeatedCauses(misses: Miss[], atLeast = 2): [string, number][] {
  const counts = new Map<string, number>();
  for (const m of misses) counts.set(m.cause, (counts.get(m.cause) ?? 0) + 1);
  return [...counts].filter(([, n]) => n >= atLeast).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
// endregion

// region: anki
/** Tab-separated lines that Anki can import. Tabs and line breaks inside a field would break a row. */
export function toAnki(misses: Miss[]): string {
  const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ").trim();
  return misses.map((m) => `${clean(m.question)}\t${clean(m.answer)}\t${clean(m.topic)}`).join("\n");
}
// endregion
