/* Build your own mock interviewer. Step 3: scoring, where a model's output gets checked before you trust it. */
export const COMPETENCIES = ["problemSolving", "codeQuality", "verification", "communication"] as const;
export type Competency = (typeof COMPETENCIES)[number];

export interface ScoreLine {
  score: number;
  /** words copied from the transcript that justify the score */
  evidence: string;
}
export type Scorecard = Record<Competency, ScoreLine>;

// region: parse
/** Returns what's wrong in words, so the same text can go back to the model on a retry. */
export function parseScorecard(raw: string, transcript: string): { card: Scorecard } | { error: string } {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: "Reply with JSON only." };
  }
  const obj = data as Record<string, ScoreLine | undefined>;
  for (const c of COMPETENCIES) {
    const line = obj?.[c];
    if (!line || !Number.isInteger(line.score) || line.score < 1 || line.score > 5) return { error: `${c}.score must be a whole number from 1 to 5.` };
    if (typeof line.evidence !== "string" || line.evidence.length < 10) return { error: `${c}.evidence must quote the transcript.` };
    if (!transcript.includes(line.evidence)) return { error: `${c}.evidence isn't in the transcript. Copy the candidate's exact words.` };
  }
  return { card: obj as unknown as Scorecard };
}
// endregion

// region: retry
export type Complete = (prompt: string) => Promise<string>;

/** One retry with the reason. After that, show no score: a made-up score is worse than none. */
export async function scoreInterview(complete: Complete, prompt: string, transcript: string): Promise<Scorecard | null> {
  let ask = prompt;
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = parseScorecard(await complete(ask), transcript);
    if ("card" in result) return result.card;
    ask = `${prompt}\n\nYour last reply was rejected: ${result.error}`;
  }
  return null;
}
// endregion
