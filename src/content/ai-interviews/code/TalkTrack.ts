/* Record a practice round, transcribe it with timestamps, and measure how you sounded. */
export interface Segment {
  /** seconds from the start */
  start: number;
  end: number;
  text: string;
}

export interface TalkReport {
  minutes: number;
  wordsPerMinute: number;
  fillersPerMinute: number;
  reasonsPerMinute: number;
  longestSilence: number;
  longSilences: number;
  longestMonologue: number;
}

// region: measure
const FILLERS = /\b(um+|uh+|erm|like|basically|you know|kind of|sort of)\b/gi;
/** Words that signal a reason. Saying what you do is narration; saying why is the signal interviewers want. */
const REASONS = /\b(because|so that|trade-?off|instead of|the risk is|which means)\b/gi;

export function analyseTalk(segments: Segment[], silenceLimit = 20): TalkReport {
  if (segments.length === 0) throw new Error("no speech in this recording");
  const text = segments.map((s) => s.text).join(" ");
  const minutes = (segments[segments.length - 1].end - segments[0].start) / 60;
  let longestSilence = 0;
  let longSilences = 0;
  let longestMonologue = 0;
  let runStart = segments[0].start;
  segments.forEach((s, i) => {
    const gap = i === 0 ? 0 : s.start - segments[i - 1].end;
    if (gap > longestSilence) longestSilence = gap;
    if (gap > silenceLimit) longSilences++;
    if (gap > 3) runStart = s.start; // a pause of over 3 seconds ends a monologue
    longestMonologue = Math.max(longestMonologue, s.end - runStart);
  });
  const per = (n: number) => Math.round((n / minutes) * 10) / 10;
  return {
    minutes: Math.round(minutes * 10) / 10,
    wordsPerMinute: Math.round(text.split(/\s+/).filter(Boolean).length / minutes),
    fillersPerMinute: per((text.match(FILLERS) ?? []).length),
    reasonsPerMinute: per((text.match(REASONS) ?? []).length),
    longestSilence,
    longSilences,
    longestMonologue,
  };
}
// endregion

// region: advice
export function talkAdvice(r: TalkReport): string[] {
  const out: string[] = [];
  if (r.longSilences > 0) out.push(`You went quiet ${r.longSilences} time(s). Before a long think, say what you're checking.`);
  if (r.longestMonologue > 180) out.push("You talked for over 3 minutes without a pause. Stop and check in with the interviewer.");
  if (r.reasonsPerMinute < 1) out.push("You said what you did but rarely why. Give a reason at each decision.");
  if (r.fillersPerMinute > 6) out.push("Lots of fillers. Replace them with a short silence.");
  return out;
}
// endregion
