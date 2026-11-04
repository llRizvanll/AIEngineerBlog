"use client";

import { useState } from "react";

export function CopyCode({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="ed-copy"
      aria-label="Copy code"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        });
      }}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
