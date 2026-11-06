"use client";

import { useState } from "react";
import { PromptCard } from "./PromptCard";

const ROUNDS: Record<string, string> = {
  "AI-allowed coding": "an AI-allowed live coding round. Give me one multi-stage problem in a small codebase, and let me ask you for code as my assistant, but challenge anything I accept without checking",
  "Code comprehension": "a code comprehension round. Show me about 40 lines of unfamiliar code with hidden bugs, and ask me to explain it, find what's wrong and fix it",
  "LLM fundamentals": "an LLM fundamentals screen. Cover tokens, context limits, embeddings, caching, hallucination, prompt injection and cost sums",
  "RAG design": "a RAG system design round. Start with a vague product request, and probe chunking, search, permissions, metrics and failure handling",
  "Agent design": "an agent design round. Probe stop conditions, tool risk, approvals, retries, prompt injection and how I'd evaluate it",
  "Evals": "an evals round. Give me a feature and have me design the eval before any prompt. Probe failure modes, rubric precision, data coverage and judge validation",
  "Customer conversation": "a customer conversation role-play. Play a busy, non-technical customer who says the AI product feels dumb, and only give an example if I ask for one",
  Behavioural: "a behavioural round about AI work. Ask for specific examples, then push on what I personally did, what I measured and what went wrong",
};
const LEVELS = ["Junior", "Mid-level", "Senior", "Staff or principal"];
const STYLES: Record<string, string> = {
  Tough: "Be demanding, and don't reassure me.",
  Balanced: "Be fair and professional.",
  Friendly: "Be warm, but still don't give me answers.",
};
const MINUTES = [15, 30, 45, 60];

const pick = <T extends string | number>(label: string, value: T, options: readonly T[], set: (v: T) => void) => (
  <label className="pb-field">
    <span>{label}</span>
    <select
      value={String(value)}
      onChange={(e) => {
        const found = options.find((o) => String(o) === e.target.value);
        if (found !== undefined) set(found);
      }}
    >
      {options.map((o) => (
        <option key={String(o)} value={String(o)}>
          {String(o)}
          {typeof o === "number" ? " minutes" : ""}
        </option>
      ))}
    </select>
  </label>
);

/** Builds a mock-interview prompt for whichever assistant you already use. Nothing leaves your browser. */
export function PromptBuilder() {
  const [round, setRound] = useState("AI-allowed coding");
  const [level, setLevel] = useState("Senior");
  const [style, setStyle] = useState("Tough");
  const [minutes, setMinutes] = useState(45);
  const [role, setRole] = useState("");
  const text = [
    `You are interviewing me for a ${level.toLowerCase()} ${role.trim() || "software engineer"} role. This is ${ROUNDS[round]}.`,
    `The round lasts ${minutes} minutes. ${STYLES[style]}`,
    "Ask one question at a time, and keep your replies short. If an answer is weak, probe it before moving on. Don't teach me, and don't give me the answer during the round.",
    "When I say 'end', score me from 1 to 5 on problem solving, code quality, verification and communication. Quote my exact words as evidence for each score. If you have no evidence for a score, say so and score it lower. Then name the one change that would raise my score most.",
    "Start now with your first question.",
  ].join("\n\n");
  return (
    <div className="pb">
      <div className="pb-grid">
        {pick("Round", round, Object.keys(ROUNDS), setRound)}
        {pick("Level", level, LEVELS, setLevel)}
        {pick("Style", style, Object.keys(STYLES), setStyle)}
        {pick("Length", minutes, MINUTES, setMinutes)}
        <label className="pb-field pb-role">
          <span>Role (optional)</span>
          <input type="text" value={role} placeholder="Applied AI engineer" onChange={(e) => setRole(e.target.value)} />
        </label>
      </div>
      <PromptCard title="Your mock interview prompt" note="Copy it into the assistant you already use." text={text} />
    </div>
  );
}
