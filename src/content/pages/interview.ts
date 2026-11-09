/* Words for the interview page. Edit the text here; the page only lays it out. */
import type { Metadata } from "next";

export const INTERVIEW_ROOM_META: Metadata = { title: "Interview room", description: "Real-world system design rounds with a clock, practice mode and a whiteboard." };

export const INTERVIEW_ROOM_COPY = {
  kicker: "Interview room",
  title: { lead: "Eleven rounds. One ", accent: "whiteboard." },
  intro: "Real system design questions, asked the way principal panels ask them. Practice mode hides each model answer until you write yours. Start the clock and draw on the whiteboard.",
  steps: [
    ["Clarify", "Ask about users, scale, constraints. State assumptions."],
    ["Estimate", "Do the arithmetic that decides the design."],
    ["Draw", "Components, data stores and arrows. Then one flow."],
    ["Go deep", "Pick the hardest part and explain the mechanism."],
    ["Defend", "Trade-offs, failures, rollout and how the team builds it."],
  ],
  shelf: { title: "AI system design rounds", blurb: "Semantic caches, red teams, Ray Serve" },
  footer: "AI Engineer · interview room",
};
