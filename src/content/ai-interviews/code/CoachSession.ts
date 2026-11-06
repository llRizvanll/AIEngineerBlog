/* Build your own mock interviewer. Step 1: the interview is a state machine, and your code owns it. */
export type Phase = "clarify" | "solve" | "probe" | "score" | "done";
export type CoachEvent =
  | { type: "say"; text: string }
  | { type: "reply"; text: string }
  | { type: "advance" }
  | { type: "hint" }
  | { type: "tick"; seconds: number };

export interface Session {
  phase: Phase;
  turns: { who: "candidate" | "interviewer"; text: string }[];
  hints: number;
  probes: number;
  secondsLeft: number;
}

const ORDER: Phase[] = ["clarify", "solve", "probe", "score", "done"];
export const MAX_PROBES = 3;

export const startSession = (minutes: number): Session => ({ phase: "clarify", turns: [], hints: 0, probes: 0, secondsLeft: minutes * 60 });

// region: step
/** A pure function: old state plus event gives new state. The model never decides what phase it's in. */
export function step(s: Session, e: CoachEvent): Session {
  if (s.phase === "done") return s;
  const advance = (from: Session): Session => ({ ...from, phase: ORDER[ORDER.indexOf(from.phase) + 1] });
  switch (e.type) {
    case "say":
      return { ...s, turns: [...s.turns, { who: "candidate", text: e.text }] };
    case "reply": {
      const next = { ...s, turns: [...s.turns, { who: "interviewer" as const, text: e.text }] };
      if (s.phase !== "probe") return next;
      const probes = s.probes + 1;
      return probes >= MAX_PROBES ? advance({ ...next, probes }) : { ...next, probes };
    }
    case "hint":
      return s.phase === "solve" ? { ...s, hints: s.hints + 1 } : s;
    case "advance":
      return advance(s);
    case "tick": {
      const secondsLeft = Math.max(0, s.secondsLeft - e.seconds);
      // When time runs out, go straight to scoring, as a real interviewer would.
      return secondsLeft === 0 && ORDER.indexOf(s.phase) < ORDER.indexOf("score") ? { ...s, secondsLeft, phase: "score" } : { ...s, secondsLeft };
    }
  }
}
// endregion
