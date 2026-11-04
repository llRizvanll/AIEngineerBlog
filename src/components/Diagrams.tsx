import type { ReactNode } from "react";
import type { ArchDiagram, SeqDiagram } from "@/content/types";

/* Architecture and sequence diagrams drawn from data. Ported from the original archSVG / seqSVG. */

function wrapText(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  String(text || "")
    .split(" ")
    .forEach((w) => {
      if ((line + " " + w).trim().length > max) {
        if (line) out.push(line);
        line = w;
      } else line = (line + " " + w).trim();
    });
  if (line) out.push(line);
  return out;
}

const LEGEND: [string, string][] = [
  ["c", "Client"],
  ["s", "Service"],
  ["d", "Data store"],
  ["q", "Queue / stream"],
  ["a", "AI component"],
  ["x", "External"],
];

function Arrowhead({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="dg-ahp" />
      </marker>
    </defs>
  );
}

export function ArchSvg({ a, uid = "a" }: { a: ArchDiagram; uid?: string }) {
  const W = 760,
    M = 16,
    base = 44,
    rowH = 100,
    boxH = 60;
  const cellW = (W - 2 * M) / a.cols,
    boxW = cellW - 56;
  const H = base + a.rows * rowH + 6;
  const marker = `dg-ah-${uid}`;
  type P = { x: number; y: number; w: number; h: number; cx: number; cy: number; c: number; r: number };
  const pos: Record<string, P> = {};
  a.nodes.forEach((n) => {
    const x = M + n[3] * cellW + 28,
      y = base + n[4] * rowH;
    pos[n[0]] = { x, y, w: boxW, h: boxH, cx: x + boxW / 2, cy: y + boxH / 2, c: n[3], r: n[4] };
  });

  const groups: ReactNode[] = (a.groups || []).map((gr, i) => {
    const x = M + gr[1] * cellW + 4,
      x2 = M + (gr[2] + 1) * cellW - 4;
    const y = base + gr[3] * rowH - 30,
      y2 = base + gr[4] * rowH + boxH + 14;
    return (
      <g key={`g${i}`}>
        <rect className="dg-grp" x={x} y={y} width={x2 - x} height={y2 - y} rx={12} />
        <text className="dg-grpt" x={x + 12} y={y + 17}>
          {gr[0].toUpperCase()}
        </text>
      </g>
    );
  });

  const ports: Record<string, number> = {};
  const port = (id: string, side: string) => {
    const k = id + side,
      n = ports[k] || 0;
    ports[k] = n + 1;
    const tb = side === "t" || side === "b";
    return (tb ? [0, -26, 26, -46, 46] : [0, -12, 12, -20, 20])[n] || 0;
  };
  const label = (key: string, x: number, y: number, t: string, anchor: string) => {
    if (!t) return null;
    const w = t.length * 6.1 + 10;
    let ax = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
    if (ax + w > 758) ax = 758 - w;
    if (ax < 2) ax = 2;
    return (
      <g key={key}>
        <rect className="dg-lbg" x={ax} y={y - 11} width={w} height={15} rx={4} />
        <text className="dg-lbl" x={ax + 5} y={y}>
          {t}
        </text>
      </g>
    );
  };

  const edges: ReactNode[] = [];
  const labels: ReactNode[] = [];
  a.edges.forEach((ed, i) => {
    const s = pos[ed[0]],
      t = pos[ed[1]];
    if (!s || !t) return;
    const flags = ed[3] || "",
      dash = flags.includes("d"),
      both = flags.includes("b");
    const dc = t.c - s.c,
      dr = t.r - s.r,
      gapY = (rowH - boxH) / 2;
    let d = "",
      lx = 0,
      ly = 0,
      anchor = "mid";
    if (dr === 0 && Math.abs(dc) === 1) {
      const o = port(ed[1], dc > 0 ? "l" : "r");
      port(ed[0], dc > 0 ? "r" : "l");
      const y = s.cy + o,
        x1 = dc > 0 ? s.x + s.w : s.x,
        x2 = dc > 0 ? t.x : t.x + t.w;
      d = `M${x1} ${y}H${x2}`;
      lx = (x1 + x2) / 2;
      ly = y - 8;
    } else if (dc === 0 && Math.abs(dr) === 1) {
      const o = port(ed[1], dr > 0 ? "t" : "b");
      port(ed[0], dr > 0 ? "b" : "t");
      const x = s.cx + o,
        y1 = dr > 0 ? s.y + s.h : s.y,
        y2 = dr > 0 ? t.y : t.y + t.h;
      d = `M${x} ${y1}V${y2}`;
      lx = x + 7;
      ly = (y1 + y2) / 2 + 4;
      anchor = "start";
    } else if (Math.abs(dr) === 1) {
      const down = dr > 0;
      const sx = s.cx + port(ed[0], down ? "b" : "t"),
        tx = t.cx + port(ed[1], down ? "t" : "b");
      const y1 = down ? s.y + s.h : s.y,
        y2 = down ? t.y : t.y + t.h,
        yg = down ? s.y + s.h + gapY : s.y - gapY;
      d = `M${sx} ${y1}V${yg}H${tx}V${y2}`;
      lx = tx < sx ? sx - 6 : sx + 6;
      anchor = tx < sx ? "end" : "start";
      ly = yg + 4;
    } else if (dr === 0) {
      const sx = s.cx + port(ed[0], "b"),
        tx = t.cx + port(ed[1], "b"),
        yg = s.y + s.h + gapY;
      d = `M${sx} ${s.y + s.h}V${yg}H${tx}V${t.y + t.h}`;
      lx = (sx + tx) / 2;
      ly = yg + 4;
    } else if (dc === 0) {
      const xg = s.x + s.w + 28,
        o1 = port(ed[0], "r"),
        o2 = port(ed[1], "r");
      d = `M${s.x + s.w} ${s.cy + o1}H${xg}V${t.cy + o2}H${t.x + t.w}`;
      lx = xg + 4;
      ly = (s.cy + t.cy) / 2;
      anchor = "start";
    } else {
      const down = dr > 0,
        sx = s.cx + port(ed[0], down ? "b" : "t");
      const y1 = down ? s.y + s.h : s.y,
        yg = down ? s.y + s.h + gapY : s.y - gapY;
      const side = dc > 0 ? "l" : "r",
        xg = dc > 0 ? t.x - 28 : t.x + t.w + 28,
        xe = dc > 0 ? t.x : t.x + t.w,
        ty = t.cy + port(ed[1], side);
      d = `M${sx} ${y1}V${yg}H${xg}V${ty}H${xe}`;
      lx = (sx + xg) / 2;
      ly = yg + 4;
    }
    edges.push(
      <path
        key={`e${i}`}
        className={"dg-edge" + (dash ? " dash" : "")}
        d={d}
        markerEnd={`url(#${marker})`}
        markerStart={both ? `url(#${marker})` : undefined}
      />
    );
    labels.push(label(`l${i}`, lx, ly, ed[2], anchor));
  });

  const nodes = a.nodes.map((n) => {
    const p = pos[n[0]],
      k = n[5] || "s";
    const sub = wrapText(n[2], Math.floor((boxW - 8) / 6.1)).slice(0, 2);
    const ty = sub.length > 1 ? p.y + 20 : p.y + 25;
    return (
      <g key={n[0]} className={`dg-node k-${k}`}>
        <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={9} />
        {k === "d" && <path className="dg-cyl" d={`M${p.x + 8} ${p.y + 7}H${p.x + p.w - 8}`} />}
        <text className="dg-t" x={p.cx} y={ty} textAnchor="middle" style={n[1].length > 15 ? { fontSize: 11.5 } : undefined}>
          {n[1]}
        </text>
        {sub.map((l, i) => (
          <text key={i} className="dg-s" x={p.cx} y={ty + 15 + i * 12} textAnchor="middle">
            {l}
          </text>
        ))}
      </g>
    );
  });

  const legend = LEGEND.filter((l) => a.nodes.some((n) => (n[5] || "s") === l[0]));
  return (
    <>
      <div className="dg-scroll">
        <svg className="dg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Architecture diagram">
          <Arrowhead id={marker} />
          {groups}
          {edges}
          {nodes}
          {labels}
        </svg>
      </div>
      <div className="dg-legend">
        {legend.map((l) => (
          <span key={l[0]} className={`lg k-${l[0]}`}>
            <i />
            {l[1]}
          </span>
        ))}
      </div>
    </>
  );
}

export function SeqSvg({ s, uid = "s" }: { s: SeqDiagram; uid?: string }) {
  const W = 760,
    L = 72,
    R = 72,
    n = s.actors.length,
    gap = (W - L - R) / (n - 1);
  const X = (i: number) => L + i * gap;
  const marker = `sq-ah-${uid}`;
  let y = 74;
  const rows: { note?: string; m?: [number, number, string, string?]; y: number }[] = [];
  s.msgs.forEach((m) => {
    if (m[0] === "note") {
      rows.push({ note: m[1] as string, y });
      y += 34;
    } else {
      const mm = m as [number, number, string, string?];
      rows.push({ m: mm, y });
      y += mm[0] === mm[1] ? 44 : 34;
    }
  });
  const H = y + 14;
  return (
    <div className="dg-scroll">
      <svg className="dg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sequence diagram">
        <Arrowhead id={marker} />
        {s.actors.map((a, i) => (
          <g key={`a${i}`}>
            <line className="sq-life" x1={X(i)} y1={48} x2={X(i)} y2={H - 6} />
            <rect className="sq-actor" x={X(i) - 62} y={12} width={124} height={34} rx={9} />
            <text className="sq-at" x={X(i)} y={34} textAnchor="middle">
              {a}
            </text>
          </g>
        ))}
        {rows.map((rw, i) => {
          if (rw.note !== undefined)
            return (
              <g key={i}>
                <rect className="sq-note" x={16} y={rw.y - 14} width={W - 32} height={24} rx={6} />
                <text className="sq-nt" x={W / 2} y={rw.y + 2} textAnchor="middle">
                  {rw.note}
                </text>
              </g>
            );
          const m = rw.m!,
            a = m[0],
            b = m[1],
            dash = m[3] === "d";
          if (a === b) {
            const x = X(a),
              left = a === n - 1,
              dir = left ? -1 : 1;
            return (
              <g key={i}>
                <path
                  className={"sq-msg" + (dash ? " dash" : "")}
                  d={`M${x} ${rw.y - 6}h${28 * dir}v18h${-26 * dir}`}
                  markerEnd={`url(#${marker})`}
                />
                <text className="sq-ml" x={x + 34 * dir} y={rw.y + 8} textAnchor={left ? "end" : "start"}>
                  {m[2]}
                </text>
              </g>
            );
          }
          const x1 = X(a),
            x2 = X(b),
            mid = (x1 + x2) / 2,
            tw = m[2].length * 6.2 + 10;
          return (
            <g key={i}>
              <path
                className={"sq-msg" + (dash ? " dash" : "")}
                d={`M${x1} ${rw.y}H${x2 + (x2 > x1 ? -2 : 2)}`}
                markerEnd={`url(#${marker})`}
              />
              <rect className="dg-lbg" x={mid - tw / 2} y={rw.y - 17} width={tw} height={14} rx={4} />
              <text className="sq-ml" x={mid} y={rw.y - 6} textAnchor="middle">
                {m[2]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure className="fig2">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
