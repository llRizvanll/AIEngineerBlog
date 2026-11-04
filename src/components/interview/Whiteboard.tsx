"use client";

import { useEffect, useRef, useState } from "react";
import { INTERVIEW_KEY, emptyInterview, readLocal, writeLocal, type InterviewState } from "@/lib/store";

type Pt = [number, number];
type Shape =
  | { t: "pen" | "erase"; erase?: boolean; p: Pt[] }
  | { t: "box" | "arrow"; a: Pt; b: Pt }
  | { t: "text"; a: Pt; s: string };
type Tool = "pen" | "box" | "arrow" | "text" | "erase";

export function Whiteboard({ caseId }: { caseId: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const shapes = useRef<Shape[]>([]);
  const cur = useRef<Shape | null>(null);
  const toolRef = useRef<Tool>("pen");
  const [textAt, setTextAt] = useState<Pt | null>(null);
  toolRef.current = tool;

  const persist = () => {
    const s = readLocal<InterviewState>(INTERVIEW_KEY, emptyInterview);
    writeLocal(INTERVIEW_KEY, { ...s, boards: { ...s.boards, [caseId]: shapes.current.slice(-400) } });
  };

  const redraw = () => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#0d1a28";
    const r = cv.getBoundingClientRect();
    ctx.fillStyle = css("--surface");
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.fillStyle = css("--line");
    for (let x = 24; x < r.width; x += 24) for (let y = 24; y < r.height; y += 24) ctx.fillRect(x, y, 1.5, 1.5);
    const draw = (s: Shape) => {
      const erase = s.t === "erase";
      ctx.strokeStyle = erase ? css("--surface") : css("--ink");
      ctx.lineWidth = erase ? 18 : 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (s.t === "pen" || s.t === "erase") {
        ctx.beginPath();
        s.p.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
      } else if (s.t === "box") {
        ctx.beginPath();
        ctx.roundRect(s.a[0], s.a[1], s.b[0] - s.a[0], s.b[1] - s.a[1], 8);
        ctx.stroke();
      } else if (s.t === "arrow") {
        const [x1, y1] = s.a,
          [x2, y2] = s.b,
          ang = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 12 * Math.cos(ang - 0.45), y2 - 12 * Math.sin(ang - 0.45));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 12 * Math.cos(ang + 0.45), y2 - 12 * Math.sin(ang + 0.45));
        ctx.stroke();
      } else if (s.t === "text") {
        ctx.fillStyle = css("--ink");
        ctx.font = "600 15px " + css("--font-display");
        ctx.fillText(s.s, s.a[0], s.a[1]);
      }
    };
    shapes.current.forEach(draw);
    if (cur.current) draw(cur.current);
  };

  useEffect(() => {
    shapes.current = (readLocal<InterviewState>(INTERVIEW_KEY, emptyInterview).boards[caseId] as Shape[]) || [];
    const cv = canvas.current!;
    const size = () => {
      const r = cv.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      cv.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };
    size();
    window.addEventListener("resize", size);
    const mo = new MutationObserver(redraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      window.removeEventListener("resize", size);
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const pt = (e: React.PointerEvent): Pt => {
    const r = canvas.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const end = () => {
    if (!cur.current) return;
    shapes.current.push(cur.current);
    cur.current = null;
    persist();
    redraw();
  };

  return (
    <div className="wb" ref={wrap} style={{ position: "relative" }}>
      <div className="wb-tools" role="toolbar" aria-label="Whiteboard tools">
        {(["pen", "box", "arrow", "text", "erase"] as Tool[]).map((t) => (
          <button key={t} type="button" aria-pressed={tool === t} onClick={() => setTool(t)}>
            {t === "erase" ? "Eraser" : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span className="sp" />
        <button type="button" onClick={() => (shapes.current.pop(), persist(), redraw())}>
          Undo
        </button>
        <button type="button" onClick={() => ((shapes.current = []), persist(), redraw())}>
          Clear
        </button>
      </div>
      <canvas
        id="wb-canvas"
        ref={canvas}
        aria-label="Whiteboard drawing area"
        style={{ cursor: tool === "text" ? "text" : "crosshair" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = pt(e);
          const t = toolRef.current;
          if (t === "text") return setTextAt(p);
          cur.current = t === "pen" || t === "erase" ? { t, p: [p] } : { t, a: p, b: p };
        }}
        onPointerMove={(e) => {
          const c = cur.current;
          if (!c) return;
          const p = pt(e);
          if ("p" in c) c.p.push(p);
          else if ("b" in c) c.b = p;
          redraw();
        }}
        onPointerUp={end}
        onPointerCancel={end}
      />
      {textAt && (
        <input
          className="wb-text"
          autoFocus
          aria-label="Label text"
          style={{ left: textAt[0], top: textAt[1] + 44 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setTextAt(null);
          }}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v) {
              shapes.current.push({ t: "text", a: [textAt[0], textAt[1] + 5], s: v });
              persist();
              redraw();
            }
            setTextAt(null);
          }}
        />
      )}
      <div className="wb-hint">Tip: draw boxes first, then arrows, then label them with Text.</div>
    </div>
  );
}
