/* Part leads and section headings for a protocol lesson. Edit the text here; the page only lays it out. */

import type { PartKey } from "@/types/ui";

/** The lesson's five parts and which numbered sections each holds, for the roadmap at the top. */
export const ROADMAP: [PartKey, ("1.1" | "1.2" | "2.1" | "3.1" | "3.2" | "3.3" | "4.1" | "5.1")[]][] = [
  ["basics", ["1.1", "1.2"]],
  ["question", ["2.1"]],
  ["detail", ["3.1", "3.2", "3.3"]],
  ["qa", ["4.1"]],
  ["more", ["5.1"]],
];

export const PROTOCOL_DETAIL_COPY = {
  parts: {
    basics: "What the protocol is for, and the ideas it is built on.",
    question: "What this lesson prepares you to answer. Keep these in mind while you watch the packets.",
    detail: "Watch a real exchange step by step, then take each message apart field by field.",
    qa: "Check your understanding. Answer out loud, then open.",
    more: "The mistakes people make with this protocol in real systems.",
  },
  sections: {
    "1.1": {
      title: "What it does",
      intro: "The protocol in plain words, before any bytes.",
    },
    "1.2": {
      title: "Key ideas",
      intro: "The handful of ideas everything else follows from.",
    },
    "2.1": {
      title: "Target questions",
    },
    "3.1": {
      title: "Follow the packets",
      intro: "Step through the exchange between the two sides.",
    },
    "3.2": {
      title: "Decode it byte by byte",
      intro: "Click any byte or row. Each colour is one field.",
    },
    "3.3": {
      title: "Decode it in code",
      intro: "A small decoder, tested against the exact bytes shown above.",
    },
    "4.1": {
      title: "Check yourself",
    },
    "5.1": {
      title: "Watch out for",
    },
  },
  all: "← All protocols",
  footer: "AI Engineer · Protocol Explorer",
  notes: {
    answers: "The answers are in part 4.",
  },
};
