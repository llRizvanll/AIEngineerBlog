"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { emptyLibrary, LIBRARY_KEY, useLocal, type LibraryState } from "@/lib/store";

const CLAP_KEY = "pae-claps";

export function ActionBar({ id, title, baseClaps }: { id: string; title: string; baseClaps: number }) {
  const path = usePathname();
  const [claps, updateClaps] = useLocal<{ n: Record<string, number> }>(CLAP_KEY, { n: {} });
  const [lib, updateLib] = useLocal<LibraryState>(LIBRARY_KEY, emptyLibrary);
  const [pop, setPop] = useState(0);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const mine = claps.n[id] || 0;
  const saved = !!lib.saved[path];

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const clap = () => {
    if (mine >= 50) return;
    updateClaps((c) => ({ n: { ...c.n, [id]: (c.n[id] || 0) + 1 } }));
    setPop((p) => p + 1);
  };
  const listen = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = Array.from(document.querySelectorAll<HTMLElement>("[data-reading] > section h2, [data-reading] > section > p"))
      .map((e) => e.innerText)
      .join(". ");
    const u = new SpeechSynthesisUtterance(title + ". " + text);
    u.rate = 1.02;
    u.onend = () => setSpeaking(false);
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <div className="m-actions">
      <button type="button" className={"m-clap" + (mine ? " on" : "")} onClick={clap} aria-label="Clap for this post">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7.5 11.5l-1.8-3a1.3 1.3 0 0 1 2.2-1.3l3.6 6M9 9.5L7 6.2a1.3 1.3 0 0 1 2.2-1.3l4.3 7.2M11.3 8.8l-1.1-1.9a1.3 1.3 0 0 1 2.2-1.3l3.4 5.8M13.5 8.2l.3-.4a1.3 1.3 0 0 1 2.2 1.3l-.5 3.6a6 6 0 0 1-9.9 4.4L4 15" />
          <path d="M15 3l.6-1.6M18 4.5l1.3-1.1M19.5 7.5l1.6-.3" />
        </svg>
        <span>{(baseClaps + mine).toLocaleString()}</span>
        {pop > 0 && (
          <em key={pop} className="m-pop">
            +{mine}
          </em>
        )}
      </button>
      <span className="m-sp" />
      <button type="button" className={"m-ic" + (speaking ? " on" : "")} onClick={listen} title={speaking ? "Stop listening" : "Listen"}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
          {speaking ? <path d="M8 6v12M16 6v12" /> : <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 8.5v7l5.5-3.5L10 8.5z" />}
        </svg>
        <span>{speaking ? "Stop" : "Listen"}</span>
      </button>
      <button
        type="button"
        className={"m-ic" + (saved ? " on" : "")}
        title="Save to library"
        onClick={() =>
          updateLib((l) => {
            const s = { ...l.saved };
            if (s[path]) delete s[path];
            else s[path] = { title, kind: "Post", at: Date.now() };
            return { ...l, saved: s };
          })
        }
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
          <path d="M6 3h12v18l-6-4-6 4z" />
        </svg>
        <span>{saved ? "Saved" : "Save"}</span>
      </button>
      <button
        type="button"
        className="m-ic"
        title="Copy link"
        onClick={() =>
          navigator.clipboard?.writeText(location.href.split("#")[0]).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          })
        }
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
        <span>{copied ? "Copied" : "Share"}</span>
      </button>
    </div>
  );
}
