"use client";

import { useState } from "react";
import { PromptCard } from "./PromptCard";
import { PROMPT_LEVELS, PROMPT_MINUTES } from "@/config/constants";
import { PROMPT_ROUNDS, PROMPT_STYLES } from "@/content/ui-copy";

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
    `You are interviewing me for a ${level.toLowerCase()} ${role.trim() || "software engineer"} role. This is ${PROMPT_ROUNDS[round]}.`,
    `The round lasts ${minutes} minutes. ${PROMPT_STYLES[style]}`,
    "Ask one question at a time, and keep your replies short. If an answer is weak, probe it before moving on. Don't teach me, and don't give me the answer during the round.",
    "When I say 'end', score me from 1 to 5 on problem solving, code quality, verification and communication. Quote my exact words as evidence for each score. If you have no evidence for a score, say so and score it lower. Then name the one change that would raise my score most.",
    "Start now with your first question.",
  ].join("\n\n");
  return (
    <div className="pb">
      <div className="pb-grid">
        {pick("Round", round, Object.keys(PROMPT_ROUNDS), setRound)}
        {pick("Level", level, PROMPT_LEVELS, setLevel)}
        {pick("Style", style, Object.keys(PROMPT_STYLES), setStyle)}
        {pick("Length", minutes, PROMPT_MINUTES, setMinutes)}
        <label className="pb-field pb-role">
          <span>Role (optional)</span>
          <input type="text" value={role} placeholder="Applied AI engineer" onChange={(e) => setRole(e.target.value)} />
        </label>
      </div>
      <PromptCard title="Your mock interview prompt" note="Copy it into the assistant you already use." text={text} />
    </div>
  );
}
