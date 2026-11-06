/* Plant small bugs in code you trust, then find them. This trains reading, the skill AI rounds lean on. */
export interface Planted {
  line: number;
  before: string;
  after: string;
}

// region: rules
const RULES: [RegExp, string][] = [
  [/<=/, "<"],
  [/>=/, ">"],
  [/===/, "!=="],
  [/&&/, "||"],
  [/ \+ 1\b/, ""],
  [/ - 1\b/, ""],
  [/\b0\b/, "1"],
];
// endregion

// region: plant
/** A seeded generator gives the same bugs for the same seed, so you can check your answers later. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function plantBugs(code: string, count: number, seed: number): { code: string; planted: Planted[] } {
  const random = seeded(seed);
  const lines = code.split("\n");
  const options: { line: number; rule: number }[] = [];
  lines.forEach((text, line) => {
    if (text.trim().startsWith("//")) return;
    RULES.forEach(([re], rule) => {
      if (re.test(text)) options.push({ line, rule });
    });
  });
  const planted: Planted[] = [];
  while (planted.length < count && options.length > 0) {
    const [pick] = options.splice(Math.floor(random() * options.length), 1);
    if (planted.some((p) => p.line === pick.line + 1)) continue; // at most one bug per line
    const before = lines[pick.line];
    const [re, to] = RULES[pick.rule];
    lines[pick.line] = before.replace(re, to);
    planted.push({ line: pick.line + 1, before: before.trim(), after: lines[pick.line].trim() });
  }
  planted.sort((a, b) => a.line - b.line);
  return { code: lines.join("\n"), planted };
}
// endregion

// region: score
export function scoreReview(planted: Planted[], linesYouFlagged: number[]) {
  const found = planted.filter((p) => linesYouFlagged.includes(p.line)).length;
  const falseAlarms = linesYouFlagged.filter((l) => !planted.some((p) => p.line === l)).length;
  return { found, missed: planted.length - found, falseAlarms };
}
// endregion
