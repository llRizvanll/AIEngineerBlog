import type { ReactNode } from "react";

/* Four diagrams for the React Native modules, drawn at phone width so the text stays readable. Illustrative, not measured. */

function Frame({ title, caption, children, height }: { title: string; caption: string; children: ReactNode; height: number }) {
  return (
    <figure className="rd">
      <svg viewBox={`0 0 360 ${height}`} role="img" aria-label={title}>
        <title>{title}</title>
        {children}
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

function Bar({ x, y, w, label, tone }: { x: number; y: number; w: number; label: string; tone: "ui" | "js" | "nat" | "lay" }) {
  return (
    <g>
      <rect className={`rd-bar rd-${tone}`} x={x} y={y} width={w} height={30} rx={7} />
      <text className="rd-bt" x={x + w / 2} y={y + 19} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export function ThreadModel() {
  const lanes: [string, number][] = [["UI thread", 46], ["JS thread", 92], ["Native modules", 138], ["Layout (Yoga)", 184]];
  const ms = (t: number) => 100 + t * 3.1;
  return (
    <Frame height={282} title="Four threads over 80 milliseconds" caption="Illustrative timeline. While the JS thread renders and updates state, the animation keeps running on the UI thread.">
      {lanes.map(([name, y]) => (
        <g key={name}>
          <text className="rd-lane" x={6} y={y + 19}>
            {name}
          </text>
          <line className="rd-grid" x1={100} x2={352} y1={y + 38} y2={y + 38} />
        </g>
      ))}
      <Bar x={ms(0)} y={46} w={14 * 3.1} label="Touch" tone="ui" />
      <Bar x={ms(30)} y={46} w={50 * 3.1} label="Reanimated worklet: animation" tone="ui" />
      <Bar x={ms(6)} y={92} w={22 * 3.1} label="React render" tone="js" />
      <Bar x={ms(30)} y={92} w={22 * 3.1} label="State update" tone="js" />
      <Bar x={ms(18)} y={138} w={40 * 3.1} label="Disk · network" tone="nat" />
      <Bar x={ms(10)} y={184} w={16 * 3.1} label="Yoga" tone="lay" />
      {[0, 16, 32, 48, 64, 80].map((t) => (
        <g key={t}>
          <line className="rd-tick" x1={ms(t)} x2={ms(t)} y1={232} y2={238} />
          <text className="rd-tt" x={ms(t)} y={252} textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text className="rd-tt" x={352} y={277} textAnchor="end">
        milliseconds
      </text>
    </Frame>
  );
}

export function StateLayers() {
  const rows: [string, string, string, boolean][] = [
    ["Server state", "TanStack Query · RTK Query", "fetched again if lost", false],
    ["Client state", "Zustand · Redux Toolkit", "theme, session, flags", false],
    ["Persisted device state", "SQLite · MMKV", "unsent changes, offline data", true],
    ["Ephemeral state", "useState · form library", "gone on unmount", false],
  ];
  return (
    <Frame height={318} title="Four kinds of state and where each one lives" caption="Each kind gets its own tool. Only persisted device state has to survive the app being killed.">
      {rows.map(([name, tool, note, keep], i) => {
        const y = 10 + i * 62;
        return (
          <g key={name}>
            <rect className={keep ? "rd-card rd-keep" : "rd-card"} x={6} y={y} width={348} height={54} rx={10} />
            <text className="rd-h" x={18} y={y + 22}>
              {name}
            </text>
            <text className="rd-s" x={18} y={y + 42}>
              {tool}
            </text>
            <text className="rd-s rd-right" x={342} y={y + 22} textAnchor="end">
              {keep ? "survives a restart" : "can be rebuilt"}
            </text>
            <text className="rd-s rd-right" x={342} y={y + 42} textAnchor="end">
              {note}
            </text>
          </g>
        );
      })}
      <rect className="rd-warn" x={6} y={262} width={348} height={46} rx={10} />
      <text className="rd-wt" x={18} y={282}>
        Don't copy server responses into the global store
      </text>
      <text className="rd-s" x={18} y={299}>
        You rebuild caching, and every reader redraws.
      </text>
    </Frame>
  );
}

export function ThreeHeaps() {
  const boxes: [string, string, string, number][] = [
    ["JavaScript heap (Hermes)", "listener · timer · closure", "never removed", 12],
    ["JSI boundary", "host object", "still referenced", 108],
    ["Native heap", "Activity · view controller", "never freed", 204],
  ];
  return (
    <Frame height={300} title="One leak holding three heaps" caption="A listener nothing removes keeps a host object alive, and the host object keeps a whole screen alive.">
      {boxes.map(([name, thing, state, y]) => (
        <g key={name}>
          <rect className="rd-card" x={6} y={y} width={348} height={78} rx={12} />
          <text className="rd-h" x={20} y={y + 26}>
            {name}
          </text>
          <text className="rd-s" x={20} y={y + 48}>
            {thing}
          </text>
          <rect className="rd-pill" x={20} y={y + 54} width={118} height={18} rx={9} />
          <text className="rd-pt" x={79} y={y + 67} textAnchor="middle">
            {state}
          </text>
        </g>
      ))}
      {[90, 186].map((y) => (
        <g key={y}>
          <line className="rd-chain" x1={180} x2={180} y1={y} y2={y + 18} />
          <path className="rd-head" d={`M174 ${y + 12} L180 ${y + 20} L186 ${y + 12}`} />
        </g>
      ))}
      <text className="rd-s" x={192} y={104}>
        holds
      </text>
      <text className="rd-s" x={192} y={200}>
        holds
      </text>
      <text className="rd-s" x={180} y={294} textAnchor="middle">
        The screen can't be freed.
      </text>
    </Frame>
  );
}

export function Staircase() {
  const leaky = [96, 132, ...Array.from({ length: 10 }, (_, i) => 136 + i * 1.2)];
  const flat = [96, 132, ...Array.from({ length: 10 }, (_, i) => 136 + (i % 2) * 0.2)];
  const x = (i: number) => 44 + i * 25;
  const y = (v: number) => 200 - (v - 90) * 2.2;
  const pts = (a: number[]) => a.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <Frame height={262} title="Memory after each visit, with and without a leak" caption="Memory after a forced garbage collection, per visit. The first visits are warm-up. After that, a leak climbs and a healthy screen stays flat.">
      <line className="rd-grid" x1={44} x2={344} y1={y(90)} y2={y(90)} />
      <line className="rd-grid" x1={44} x2={44} y1={y(90)} y2={y(160)} />
      <rect className="rd-warm" x={x(0) - 6} y={y(160)} width={x(2) - x(0) + 6} height={y(90) - y(160)} />
      <text className="rd-s" x={x(0) - 2} y={y(160) + 14}>
        warm-up
      </text>
      <polyline className="rd-line rd-good" points={pts(flat)} />
      <polyline className="rd-line rd-badline" points={pts(leaky)} />
      <text className="rd-bad" x={x(11) - 8} y={y(leaky[11]) - 8} textAnchor="end">
        leak: +1.2 MB per visit
      </text>
      <text className="rd-ok" x={x(11) - 8} y={y(flat[11]) + 16} textAnchor="end">
        healthy: flat
      </text>
      <text className="rd-tt" x={44} y={226}>
        visit 1
      </text>
      <text className="rd-tt" x={344} y={226} textAnchor="end">
        visit 12
      </text>
      <text className="rd-tt" x={6} y={y(160) + 4}>
        MB
      </text>
      <text className="rd-s" x={180} y={250} textAnchor="middle">
        sampled after forcing a garbage collection
      </text>
    </Frame>
  );
}
