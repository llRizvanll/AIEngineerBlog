export interface Source {
  label: string;
  url: string;
  /** who is speaking, because a vendor's guide and a company's own post carry different weight */
  who: "The company" | "Press" | "Prep vendor" | "Individual";
  date?: string;
}

export interface PromptCard {
  title: string;
  note: string;
  text: string;
}

export interface Lesson {
  slug: string;
  title: string;
  /** a short label for lists */
  stop: string;
  question: string;
  minutes: number;
  plain: string[];
  words: [string, string][];
  story: string[];
  canDo: string[];
  steps: [string, string][];
  idea: [string, string[]][];
  table?: { title: string; note?: string; head: string[]; rows: string[][] };
  prompts?: PromptCard[];
  /** ids from CODE in code-docs.ts */
  code: string[];
  /** code our tests can't run, shown with a clear label */
  sample?: { title: string; lang: string; code: string; note: string };
  failures: [string, string][];
  check: [string, string][];
  drill: { title: string; minutes: number; steps: string[] };
  rubric?: string[];
  /** keys of SOURCES */
  sources: string[];
  next: string;
}

export interface InterviewPath {
  id: string;
  title: string;
  short: string;
  blurb: string;
  color: [string, string];
  lessons: Lesson[];
}

export interface BasicCard {
  q: string;
  a: string;
}

export interface BasicSkill {
  id: string;
  title: string;
  why: string;
  /** read this first: the few sentences that matter */
  read: string[];
  /** say these from memory */
  memorise: BasicCard[];
  drill: { title: string; minutes: number; steps: string[] };
  /** where to go deeper */
  lesson?: string;
}
