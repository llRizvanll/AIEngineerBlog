/* Words for the learn page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const LEARN_META: Metadata = {
  title: "Learn",
  description: "Lessons on AI engineering, mobile engineering and system design, grouped by skill.",
  alternates: { canonical: "/learn" },
};

export const LEARN_COPY = {
  title: "Learn",
  intro: "Lessons on AI and mobile engineering, from the basics up.",
  start: { label: "Start with lesson 1", href: "/aiengine" },
  foot: { text: "Looking for something specific? ", link: "Browse every page", href: "/explore" },
};
