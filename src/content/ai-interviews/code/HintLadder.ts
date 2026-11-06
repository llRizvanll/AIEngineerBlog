/* The hint ladder. Each step gives away a little more, and you earn each step by trying again. */
export const HINT_LEVELS = [
  "Ask me one question that shows where my reasoning goes wrong. Give no hint yet.",
  "Give one sentence that points me the right way. Don't name a data structure or an algorithm.",
  "Name the general technique, and nothing about how to apply it here.",
  "Write pseudocode for only the single step I'm stuck on.",
] as const;

export interface LadderState {
  level: number;
  /** what you had tried when you last asked */
  lastAttempt: string;
}

// region: climb
/** No new attempt means no new hint. That rule stops the slide into reading answers. */
export function nextHint(state: LadderState | null, attempt: string): LadderState | { refused: string } {
  const tried = attempt.trim();
  if (tried.length < 40) return { refused: "Write what you tried and where it broke, in a sentence or two." };
  if (!state) return { level: 0, lastAttempt: tried };
  if (tried === state.lastAttempt) return { refused: "That's the same attempt. Change something, then ask again." };
  if (state.level >= HINT_LEVELS.length - 1) return { refused: "Out of hints. Read a solution, then rebuild it tomorrow from memory." };
  return { level: state.level + 1, lastAttempt: tried };
}
// endregion

// region: prompt
export function hintPrompt(problem: string, state: LadderState): string {
  return [
    "You are coaching me through a coding interview problem.",
    "Never write the solution, corrected code, or solution pseudocode.",
    `Problem:\n${problem}`,
    `What I tried:\n${state.lastAttempt}`,
    `Your task: ${HINT_LEVELS[state.level]}`,
  ].join("\n\n");
}
// endregion
