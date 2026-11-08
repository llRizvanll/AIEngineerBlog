"use client";

import { useEffect, useState, type ReactNode } from "react";

const KEY = "pae-lang";
type Panel = { id: string; label: string; node: ReactNode };

/** Tabs for the same code in several languages. One choice applies to every sample on the page, and is remembered. */
export function LangGroup({ panels }: { panels: Panel[] }) {
  const [id, setId] = useState(panels[0].id);

  useEffect(() => {
    const read = () => {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved && panels.some((p) => p.id === saved)) setId(saved);
      } catch {}
    };
    read();
    window.addEventListener("pae-lang", read);
    return () => window.removeEventListener("pae-lang", read);
  }, [panels]);

  const pick = (next: string) => {
    setId(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    window.dispatchEvent(new Event("pae-lang"));
  };

  return (
    <div className="lang-group">
      <div className="lang-tabs" role="tablist" aria-label="Language">
        {panels.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={p.id === id} onClick={() => pick(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      {panels.map((p) => (
        <div key={p.id} role="tabpanel" hidden={p.id !== id}>
          {p.node}
        </div>
      ))}
    </div>
  );
}
