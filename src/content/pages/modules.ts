/* Words for the modules page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const MODULES_META: Metadata = {
  title: "AI systems modules",
  description: "Serving, retrieval, fine-tuning, evals, safety and GPU infrastructure, one tested module at a time.",
};

export const MODULES_COPY = {
  kicker: "AI systems",
  title: { lead: "AI systems, ", accent: "part by part." },
  intro: "Each module opens with the whole idea, states the question, walks the mechanism, then tests you. Use ",
  introLink: { label: "Explore", href: "/explore?mode=practice" },
  introTail: " to filter by mode, tier or time.",
  mobileShelf: { title: "Mobile systems", blurb: "Startup, observability, security, location, push, experiments" },
  footer: "AI Engineer · AI systems modules",
};
