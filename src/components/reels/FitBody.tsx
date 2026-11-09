"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Quick-hit reels: shrink (or gently grow) the slide so it always fits the space above the caption. */
export function FitBody({ children, watch }: { children: ReactNode; watch: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current;
    const el = inner.current;
    if (!o || !el) return;
    const run = () => {
      const cs = getComputedStyle(o);
      const have = o.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (have <= 0) return;
      let z = 1;
      el.style.setProperty("zoom", "1");
      for (let pass = 0; pass < 4; pass++) {
        const need = el.getBoundingClientRect().height;
        const next = Math.min(1.45, Math.max(0.5, z * ((have * 0.97) / need)));
        if (Math.abs(next - z) < 0.01) break;
        z = next;
        el.style.setProperty("zoom", String(z));
      }
      // Text rewraps as it scales, so make sure the last step never overflows.
      const after = el.getBoundingClientRect().height;
      if (after > have) el.style.setProperty("zoom", String(Math.max(0.5, (z * have * 0.97) / after)));
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(o);
    ro.observe(el);
    document.fonts?.ready.then(run);
    return () => ro.disconnect();
  }, [watch]);
  return (
    <div className="r-body" ref={outer}>
      <div className="r-fit" ref={inner}>
        {children}
      </div>
    </div>
  );
}
