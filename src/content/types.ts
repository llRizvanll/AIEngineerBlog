/* Content model for the portal. Every JSON file in this folder matches one of these types. */

/** [id, label, subtitle, col, row, kind] — kind: c client · s service · d data · q queue · a AI · x external */
export type ArchNode = [string, string, string, number, number, string?];
/** [from, to, label, flags] — flags: "d" dashed, "b" both directions */
export type ArchEdge = [string, string, string, string?];
/** [label, colFrom, colTo, rowFrom, rowTo] */
export type ArchGroup = [string, number, number, number, number];

export interface ArchDiagram {
  cols: number;
  rows: number;
  groups?: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
}

/** [fromActor, toActor, label, "d"?] or ["note", text] */
export type SeqMsg = [number, number, string, string?] | ["note", string];

export interface SeqDiagram {
  actors: string[];
  msgs: SeqMsg[];
}

/** [title, language, source] */
export type CodeSample = [string, string, string];
export type Pair = [string, string];

export interface InterviewCase {
  id: string;
  track: "Mobile" | "AI";
  title: string;
  minutes: number;
  tags: string[];
  prompt: string;
  why: string;
  clarify: Pair[];
  numbers: [string, string, string][];
  archIntro: string;
  arch: ArchDiagram;
  archNotes: Pair[];
  flowIntro: string;
  seq: SeqDiagram;
  flowNotes: string[];
  code: CodeSample[];
  deep: [string, string[]][];
  tradeoffs: [string, string, string, string][];
  failures: Pair[];
  followups: Pair[];
  levels: [string, string];
  draw: string[];
}

export interface FrontEndNotes {
  simple: {
    what: string;
    who: string[];
    journey: string[];
    hard: Pair[];
    analogy: string;
    oneLine: string;
  };
  fe: {
    intro: string;
    screens: ArchDiagram;
    screenNotes: Pair[];
    layers: [string, string, string][];
    uiStates: [string, string, string][];
    code: CodeSample[];
    perf: string[];
    a11y: string[];
    followups: Pair[];
  };
}

export interface DeepDive {
  id: string;
  group: "mobile" | "ai";
  title: string;
  kicker: string;
  labels?: Partial<Record<string, string>>;
  summary: string;
  does: string[];
  doesnt: string[];
  scenario?: string[];
  arch?: ArchDiagram;
  archNotes: Pair[];
  states?: Pair[];
  seq?: SeqDiagram;
  seqNotes: string[];
  code?: CodeSample[];
  platforms?: [string, string[]][];
  tech?: [string, string, string][];
  real?: Pair[];
  metrics?: Pair[];
  edges?: Pair[];
  interview?: Pair[];
}

export interface PostSection {
  h: string;
  p?: string[];
  p2?: string[];
  list?: string[];
  table?: { head: string[]; rows: string[][] };
  code?: CodeSample;
  code2?: CodeSample;
  callout?: Pair;
  arch?: ArchDiagram;
  seq?: SeqDiagram;
  figcap?: string;
}

export interface Post {
  id: string;
  num: string;
  mins: number;
  title: string;
  tags: string;
  dek: string;
  rule: string;
  tldr: string[];
  secs: PostSection[];
  qa: Pair[];
  next?: string;
}

export interface PacketField {
  /** name */
  n: string;
  /** hex bytes */
  x: string;
  /** description */
  d: string;
  /** kind, "t" = text */
  k?: string;
}

export interface Protocol {
  id: string;
  name: string;
  full: string;
  layer: "Application" | "Transport" | "Internet";
  port: string;
  tag: string;
  intro: string[];
  ideas: Pair[];
  gotchas: string[];
  qa: Pair[];
  packets: { tab: string; note: string; fields: PacketField[] }[];
  actors: string[];
  /** [from, to, label, caption] */
  steps: [number, number, string, string][];
}

/** [section, kind, question, answer] */
export type CriticalQ = [string, "Incident" | "Probe" | "Trap", string, string];

export interface ReelTheme {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
}

export interface ReelCta {
  label?: string;
  post: string;
  section?: string;
}

interface ReelBase {
  id: string;
  title: string;
  tags?: string[];
  captions?: string[];
  caption?: string;
  beatMs?: number | number[];
  cta?: ReelCta;
}

export type Reel = ReelBase &
  (
    | { template: "read"; pages: { h?: string; p: string; ex?: string; say?: boolean; exLabel?: string }[]; exLabel?: string }
    | { template: "hook"; lines: string[]; kicker?: string; accent?: string; size?: string }
    | { template: "steps"; items: { h: string; p?: string }[]; heading?: string }
    | { template: "compare"; left: { label: string; items: string[] }; right: { label: string; items: string[] }; verdict?: string; heading?: string }
    | { template: "flow"; nodes: { t: string; s?: string }[]; heading?: string }
    | { template: "analogy"; pairs: Pair[]; heading?: string }
    | {
        template: "code";
        lines: string[];
        /** window: inclusive line range to show for this beat (long files); hl and window index into lines */
        beats: { hl?: number[]; note?: string; window?: [number, number] }[];
        heading?: string;
        problem?: string;
        lang?: string;
        kicker?: string;
        /** show real line numbers starting at this number */
        firstLine?: number;
      }
    | { template: "stat"; value: number; unit: string; caption?: string; sub?: string }
    | { template: "quiz"; q: string; options: string[]; answer: number; why?: string; kicker?: string }
    | { template: "upload"; parts?: number; killAt?: number; file?: string; heading?: string }
  );

export interface ReelCollection {
  id: string;
  group: "learn" | "quick";
  title: string;
  blurb: string;
  theme: ReelTheme;
  reels: Reel[];
}
