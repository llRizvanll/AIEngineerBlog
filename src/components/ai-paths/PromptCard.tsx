"use client";

import { useState } from "react";
import { track } from "@/lib/track";

export function PromptCard({ title, note, text }: { title: string; note?: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pc">
      <div className="pc-head">
        <h4>{title}</h4>
        <button
          type="button"
          className="pc-copy"
          onClick={() => {
            navigator.clipboard?.writeText(text).then(() => {
              track("prompt_copied", { prompt: title });
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            });
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {note && <p className="pc-note">{note}</p>}
      <pre className="pc-text">{text}</pre>
    </div>
  );
}
