"use client";

import { memo, useEffect, useRef, type CSSProperties } from "react";
import type { Item } from "./types";

export const UpNext = memo(function UpNext({ list, cur, done, onGo }: { list: Item[]; cur: number; done: Record<string, boolean>; onGo: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector(".on")?.scrollIntoView({ block: "nearest" });
  }, [cur]);
  return (
    <div className="un" ref={ref}>
      {list.map((x, i) => (
        <button key={x.c.id + x.r.id} type="button" className={(i === cur ? "on" : "") + (done[x.r.id] ? " done" : "")} onClick={() => onGo(i)}>
          <i>{String(i + 1).padStart(2, "0")}</i>
          <span>
            {x.r.title}
            <span className="c" style={{ "--sw": x.c.theme.accent } as CSSProperties}>
              <b />
              {x.c.title}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
});
