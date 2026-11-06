"use client";

import Link from "next/link";
import { useState } from "react";
import type { MapLayer } from "@/lib/system-map";
import { MODE_LABEL, type Domain, type PortalMode } from "@/types/portal";

const MODES: PortalMode[] = ["learn", "practice", "revise"];

function Layer({ l, open, onToggle }: { l: MapLayer; open: boolean; onToggle: () => void }) {
  return (
    <div className={`sm-layer sm-${l.id}` + (open ? " open" : "")}>
      <button type="button" className="sm-row" aria-expanded={open} onClick={onToggle}>
        <span className="sm-dot" aria-hidden />
        <span className="sm-tx">
          <b>{l.name}</b>
          <span>{l.blurb}</span>
        </span>
        <span className="sm-total">{l.counts.learn + l.counts.practice + l.counts.revise}</span>
      </button>
      {open && (
        <div className="sm-panel">
          {MODES.map(
            (mode) =>
              l.counts[mode] > 0 && (
                <div key={mode} className={`sm-col am-${mode}`}>
                  <Link className="sm-mode" href={`/explore?domain=${l.id}&mode=${mode}`}>
                    {MODE_LABEL[mode]} · {l.counts[mode]} →
                  </Link>
                  {l.picks[mode].map((p) => (
                    <Link key={p.href} href={p.href} className="sm-pick">
                      {p.title}
                    </Link>
                  ))}
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}

/** The epitome: the whole system on one screen, opening into any layer. */
export function SystemMap({ layers }: { layers: MapLayer[] }) {
  const [open, setOpen] = useState<Domain | null>("model-serving");
  const toggle = (id: Domain) => setOpen((o) => (o === id ? null : id));
  return (
    <div className="sysmap">
      <div className="sm-h">
        <b>System map</b>
        <span>One request, phone to GPU. Tap a layer.</span>
      </div>
      <div className="sm-path">
        {layers
          .filter((l) => l.group === "path")
          .map((l) => (
            <Layer key={l.id} l={l} open={open === l.id} onToggle={() => toggle(l.id)} />
          ))}
      </div>
      <div className="sm-sub">Around every request</div>
      <div className="sm-around">
        {layers
          .filter((l) => l.group === "around")
          .map((l) => (
            <Layer key={l.id} l={l} open={open === l.id} onToggle={() => toggle(l.id)} />
          ))}
      </div>
    </div>
  );
}
