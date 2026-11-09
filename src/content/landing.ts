/* Everything the landing page says and links to, as data. The sections in components/landing render it,
   so changing the page's words, cards or order means editing this file only.
   `art` names one of the illustrations in components/landing/art.tsx. */

export type LandingArt = "ai" | "mobile" | "practice" | "build" | "interview";

export interface Heading {
  /** plain text, then an optional italic ending: "Choose where to" + "start." */
  text: string;
  em?: string;
  sub?: string;
}

export interface LandingCard {
  id: string;
  title: string;
  blurb: string;
  href: string;
  cta: string;
  /** a pastel tone, as an index into the tone scale */
  tone: number;
  art: LandingArt;
}

export const HERO = {
  headline: ["Know", "inside out."],
  lede: "For engineers who want to know how AI and mobile systems work underneath.",
  primary: { label: "Your dashboard", href: "/learn" },
  secondary: { label: "See a lesson", anchor: "inside" },
} as const;

export const SECTION_IDS = { start: "start", lesson: "inside", more: "more", faq: "faq" } as const;

export const START: { heading: Heading; cards: LandingCard[] } = {
  heading: { text: "Choose where to", em: "start.", sub: "Two subjects, and what is inside each." },
  cards: [
    { id: "ai", title: "AI engineering", blurb: "Learn how models work, then build on them.", href: "/aiengine", cta: "Start with lesson 1", tone: 1, art: "ai" },
    { id: "mobile", title: "Mobile engineering", blurb: "Learn the systems behind fast, reliable apps.", href: "/paths/react-native", cta: "Start with lesson 1", tone: 3, art: "mobile" },
  ],
};

export interface LessonStep {
  title: string;
  code: string;
  note: string;
}

/** One worked example, shown on the landing page so a visitor can see what a lesson feels like. */
export const LESSON_PREVIEW = {
  heading: { text: "See a lesson from the inside.", sub: "Why an edit can vanish when the app is killed, one step at a time." } as Heading,
  topic: "Offline sync",
  example: "Example 1.1",
  title: "The edit that disappeared",
  question: "A user types a note offline, then the OS kills the app. Where was the note, and what survives?",
  steps: [
    { title: "Write to memory only", code: "store.notes.push(note)", note: "Fast, and gone the moment the process dies." },
    { title: "The OS ends the app", code: "SIGKILL", note: "There is no warning and no cleanup callback to rely on." },
    { title: "Write to a queue on disk first", code: "INSERT INTO queue (id, payload)", note: "The row is still there on the next launch, ready to send." },
  ] as LessonStep[],
  answer: "Persist the mutation before showing success. Memory is for speed, the queue is for truth.",
  link: { label: "Read the whole lesson", href: "/series/background-sync" },
};

export const FEATURES: { heading: Heading; cards: LandingCard[] } = {
  heading: { text: "More than", em: "lessons.", sub: "Put what you read to work." },
  cards: [
    { id: "practice", title: "Daily practice", blurb: "A few questions a day, so what you read stays with you.", href: "/practice", cta: "Start practising", tone: 5, art: "practice" },
    { id: "build", title: "Build it yourself", blurb: "Tested components you build and run on your own machine.", href: "/mobile-coding", cta: "See the projects", tone: 6, art: "build" },
    { id: "interview", title: "Interview prep", blurb: "Know every round, in order, before you walk in.", href: "/interviews", cta: "Pick your round", tone: 4, art: "interview" },
  ],
};

export const FAQ_HEADING = "Questions, answered.";

export const FAQ: [question: string, answer: string][] = [
  ["Is it free?", "Yes. Every lesson, problem, flashcard and code sample is free to read. There is no account and no paywall."],
  ["Where do I start?", "If you are new to AI, start with the AI curriculum. If you build apps, start with React Native in one place. If you have an interview coming, start with the AI interview paths."],
  ["Does it cover coding interviews with an AI assistant?", "Yes. There are four paths: the hacks people share online, the rounds companies run now, how to use AI well in a round, and a path you build yourself. Each ends with practice."],
  ["Is the code tested?", "The code samples are compiled and run, including the buggy versions, and each one has notes that explain it line by line."],
  ["Can I study a page with Claude, ChatGPT or Gemini?", "Every lesson has Study with AI buttons. They copy the page as Markdown, or open the tool with the page ready to paste."],
  ["Where is my progress saved?", "In your own browser. Nothing is sent to a server, so clearing site data resets it."],
];

export const FOOTER = {
  note: "Your progress and notes stay in this browser.",
  link: { label: "Browse every page", href: "/explore" },
};
