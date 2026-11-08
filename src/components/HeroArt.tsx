/* Landing artwork: detailed line illustrations on pastel objects (notebooks, a card tin, a sticker board, a badge),
   with our own subjects inside: tokens, attention, agent loops, sync queues, latency.
   Fixed colours on purpose, so it reads the same in light and dark. */

const INK = "#1d1c1a";
const OR = "#ff5a1f";
const CREAM = "#fcfbf8";
const SAND = "#efeadd";
const SHADOW = { filter: "drop-shadow(0 12px 12px rgba(60, 48, 30, 0.22))" } as const;
const mono = { fontFamily: "var(--font-mono)" } as const;
const serif = { fontFamily: "var(--font-serif)" } as const;
const sans = { fontFamily: "var(--font-display)" } as const;

const Defs = () => (
  <defs>
    <pattern id="dots" width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r=".6" fill={INK} opacity=".17" />
    </pattern>
    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M10 0H0V10" fill="none" stroke={INK} strokeOpacity=".08" />
    </pattern>
  </defs>
);

/** A notebook: pastel cover with a dotted texture, a spine tab, a label, and a framed picture. */
function Notebook({ x, y, rot, tone, label, sub, children }: { x: number; y: number; rot: number; tone: string; label: string; sub: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="130" y="40" width="24" height="70" rx="10" fill={tone} stroke={INK} strokeOpacity=".28" />
      <rect width="146" height="188" rx="12" fill={tone} stroke={INK} strokeOpacity=".3" />
      <rect width="146" height="188" rx="12" fill="url(#dots)" />
      <rect x="1" y="1" width="144" height="186" rx="11" fill="none" stroke="#fff" strokeOpacity=".55" />
      <text x="12" y="20" fontSize="9.5" fill={INK} style={mono}>{label}</text>
      <text x="12" y="31" fontSize="5.6" fill={INK} opacity=".6" style={mono}>{sub}</text>
      <rect x="14" y="42" width="118" height="124" rx="6" fill={CREAM} stroke={INK} strokeWidth="2.2" />
      <g transform="translate(14 42)">{children}</g>
      <text x="14" y="180" fontSize="5.6" fill={INK} opacity=".55" style={mono}>ai engineer · vol. 1</text>
    </g>
  );
}

function Tokens() {
  const toks: [string, string][] = [["How", "4438"], ["many", "867"], ["r's", "428"], ["are", "389"], ["in", "287"], ["straw", "41236"]];
  return (
    <g>
      {toks.map(([t, id], i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const hot = i === 5;
        return (
          <g key={t} transform={`translate(${10 + col * 56} ${12 + row * 36})`}>
            <rect width="50" height="26" rx="5" fill={hot ? OR : "none"} stroke={INK} strokeWidth="1.7" />
            <text x="25" y="12" fontSize="9" textAnchor="middle" fill={hot ? "#fff" : INK} style={mono}>{t}</text>
            <text x="25" y="22" fontSize="6.5" textAnchor="middle" fill={hot ? "#fff" : INK} opacity={hot ? 0.9 : 0.5} style={mono}>{id}</text>
          </g>
        );
      })}
      <path d="M12 116h94" stroke={INK} strokeWidth="1.4" strokeDasharray="3 3" />
    </g>
  );
}

function Attention() {
  const heat = [[9, 2, 1, 1, 0], [3, 8, 2, 1, 1], [1, 3, 7, 3, 1], [1, 1, 4, 8, 3], [2, 1, 2, 4, 9]];
  return (
    <g>
      {heat.map((r, i) => r.map((v, j) => (
        <rect key={`${i}${j}`} x={14 + j * 19} y={10 + i * 19} width="16" height="16" rx="3" fill={v > 7 ? OR : INK} fillOpacity={v > 7 ? 1 : v / 24} stroke={INK} strokeOpacity=".5" strokeWidth="0.8" />
      )))}
      <path d="M14 108h92" stroke={INK} strokeWidth="1.4" />
      {[0, 1, 2, 3, 4].map((j) => <path key={j} d={`M${22 + j * 19} 108v5`} stroke={INK} strokeWidth="1.4" />)}
    </g>
  );
}

function Agents() {
  return (
    <g>
      <circle cx="59" cy="46" r="30" fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="4 4" />
      {[[59, 16, "think"], [89, 62, "act"], [29, 62, "look"]].map(([cx, cy, t]) => (
        <g key={t as string}>
          <circle cx={cx as number} cy={cy as number} r="7" fill={CREAM} stroke={INK} strokeWidth="2" />
          <text x={(cx as number) + (t === "look" ? -12 : t === "act" ? 12 : 0)} y={(cy as number) + (t === "think" ? -11 : 17)} fontSize="6.5" textAnchor="middle" fill={INK} style={mono}>{t as string}</text>
        </g>
      ))}
      <circle cx="74" cy="20" r="4.5" fill={OR} />
      <path d="M32 104h56l-6-22H38z" fill={SAND} stroke={INK} strokeWidth="1.8" />
      <path d="M52 82v-6h16v6" fill="none" stroke={INK} strokeWidth="1.8" />
      <path d="M60 95v-8M72 95v-10M48 95v-6" stroke={INK} strokeWidth="1.5" />
    </g>
  );
}

export function HeroLeft() {
  return (
    <svg viewBox="0 0 330 470" role="img" aria-label="" width="100%" style={SHADOW}>
      <Defs />
      <Notebook x={104} y={4} rot={7} tone="#dcd3ec" label="ATTENTION" sub="who looks at whom"><Attention /></Notebook>
      <Notebook x={6} y={34} rot={-7} tone="#bfe0d8" label="TOKENS" sub="text becomes numbers"><Tokens /></Notebook>
      <Notebook x={58} y={150} rot={-2} tone="#ebc7bf" label="AGENTS" sub="look, think, act, repeat"><Agents /></Notebook>
      {/* card tin */}
      <g transform="translate(4 356) rotate(-4)">
        <rect x="0" y="36" width="254" height="86" rx="22" fill="#2f6a4f" stroke={INK} strokeOpacity=".4" />
        <rect x="8" y="44" width="238" height="22" rx="10" fill="#3c7f61" />
        {[["RAG", 16, "#dcd3ec"], ["Evals", 100, "#ebc7bf"], ["Mobile", 58, "#bfe0d8"]].map(([t, x, c], i) => (
          <g key={t as string} transform={`translate(${x} ${i === 1 ? 6 : 14 - i})`}>
            <path d="M0 26q0-14 10-14h62q10 0 10 14z" fill={c as string} stroke={INK} strokeOpacity=".35" />
            <text x="41" y="23" fontSize="10.5" textAnchor="middle" fill={INK} style={mono}>{t as string}</text>
          </g>
        ))}
        <rect x="14" y="62" width="226" height="44" rx="6" fill={CREAM} stroke={INK} strokeOpacity=".35" />
        <path d="M24 78h206" stroke={OR} strokeWidth="1.5" />
        <path d="M24 90h206M24 100h206" stroke="#9aa7d0" strokeWidth="1" />
        <rect x="0" y="84" width="254" height="40" rx="18" fill="#2f6a4f" />
        <rect x="4" y="88" width="246" height="6" rx="3" fill="#3c7f61" />
      </g>
    </svg>
  );
}

function Sticker({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="108" height="94" rx="10" fill={CREAM} stroke={INK} strokeWidth="1.8" />
      <rect width="108" height="94" rx="10" fill="url(#grid)" />
      {children}
    </g>
  );
}

export function HeroRight() {
  return (
    <svg viewBox="0 0 330 620" role="img" aria-label="" width="100%" style={SHADOW}>
      <Defs />
      <g transform="translate(40 8) rotate(5)">
        <rect width="256" height="244" rx="12" fill="#ecd9a6" />
        <rect width="256" height="244" rx="12" fill="url(#dots)" />
        <Sticker x={14} y={14}>
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <rect x="34" y="10" width="40" height="74" rx="8" fill={CREAM} />
            <path d="M44 24h20M44 34h14" />
            <path d="M44 56a10 10 0 0 1 18-4M64 62a10 10 0 0 1-18 4" stroke={OR} strokeWidth="2.4" />
          </g>
        </Sticker>
        <Sticker x={134} y={10}>
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <circle cx="54" cy="46" r="26" fill={CREAM} />
            <path d="M54 46V28M54 46l12 8M46 14h16" />
            <circle cx="54" cy="46" r="3" fill={OR} stroke="none" />
          </g>
        </Sticker>
        <Sticker x={10} y={122}>
          <g stroke={INK} strokeWidth="1.8" fill="none">
            {[0, 1, 2].map((i) => <rect key={i} x={20 + i * 6} y={56 - i * 18} width="68" height="16" rx="5" fill={i === 2 ? "#ffd9c7" : CREAM} />)}
            <circle cx="30" cy="30" r="3" fill={OR} stroke="none" />
          </g>
        </Sticker>
        <Sticker x={130} y={120}>
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <rect x="12" y="14" width="84" height="56" rx="6" fill={CREAM} />
            <path d="M18 52l14-10 12 6 14-22 12 10 14-14" stroke={OR} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M18 62h72" strokeOpacity=".4" />
          </g>
        </Sticker>
      </g>
      {/* lanyard and badge */}
      <path d="M-10 300C70 270 150 318 240 318" stroke="#2e57b3" strokeWidth="13" fill="none" strokeLinecap="round" />
      <g transform="translate(76 322) rotate(4)">
        <rect x="64" y="-14" width="30" height="26" rx="8" fill="#c9cdd4" stroke={INK} strokeOpacity=".4" />
        <rect x="0" y="12" width="186" height="248" rx="18" fill={CREAM} stroke={INK} strokeOpacity=".3" />
        <rect x="64" y="24" width="58" height="8" rx="4" fill="#e6e3dc" />
        <text x="18" y="62" fontSize="9" fill={INK} opacity=".6" style={mono}>AI ENGINEER</text>
        <text x="18" y="108" fontSize="34" fill={INK} style={serif}>Mobile</text>
        <text x="18" y="144" fontSize="36" fontStyle="italic" fill={INK} style={serif}>Principal</text>
        <rect x="0" y="168" width="186" height="92" fill="#e4c9a4" />
        <rect x="0" y="244" width="186" height="16" rx="0" fill="#e4c9a4" />
        <rect x="18" y="186" width="150" height="48" rx="8" fill="#2b2a27" />
        {["1", "4"].map((d, i) => (
          <g key={d}>
            <rect x={28 + i * 40} y="194" width="34" height="32" rx="4" fill="#3a3936" />
            <text x={45 + i * 40} y="219" fontSize="24" textAnchor="middle" fill={i ? OR : "#e9e6df"} style={mono}>{d}</text>
          </g>
        ))}
        <text x="116" y="216" fontSize="13" fill="#e9e6df" style={mono}>days</text>
      </g>
      <path d="M262 36l8 18 18 8-18 8-8 18-8-18-18-8 18-8z" fill={OR} transform="translate(8 536) scale(.9)" />
    </svg>
  );
}

const frame = (children: React.ReactNode) => (
  <svg viewBox="0 0 520 300" role="img" aria-label="" width="100%" style={SHADOW}>
    <Defs />
    {children}
  </svg>
);

export function ArtAIBig() {
  const words = ["The", "capital", "of", "Australia", "is"];
  let x = 20;
  const placed = words.map((w) => {
    const width = w.length * 9.5 + 22;
    const at = x;
    x += width + 8;
    return { w, at, width };
  });
  return frame(
    <g>
      <path d="M26 14h468a14 14 0 0 1 14 14v176a14 14 0 0 1-14 14H110l-36 40 6-40H26a14 14 0 0 1-14-14V28a14 14 0 0 1 14-14z" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <text x="32" y="48" fontSize="22" fill={INK} style={sans}>The capital of Australia is</text>
      <rect x="297" y="30" width="3" height="22" fill={OR} />
      <rect x="28" y="62" width="456" height="142" rx="4" fill={SAND} stroke={INK} strokeWidth="1.8" />
      <rect x="28" y="62" width="456" height="142" fill="url(#dots)" />
      {placed.map(({ w, at, width }) => (
        <g key={w}>
          <rect x={at + 8} y="168" width={width} height="24" rx="4" fill={CREAM} stroke={INK} strokeWidth="1.6" />
          <text x={at + 8 + width / 2} y="184" fontSize="11.5" textAnchor="middle" fill={INK} style={mono}>{w}</text>
        </g>
      ))}
      <path d="M96 164c36-62 140-62 214 0" stroke={INK} strokeWidth="2.4" fill="none" />
      <path d="M140 164c24-34 78-34 110 0" stroke={INK} strokeWidth="1" opacity=".4" fill="none" />
      <path d="M302 166c10-24 30-24 38 0" stroke={INK} strokeWidth="2" fill="none" />
      <text x="170" y="112" fontSize="11" fill={INK} style={mono}>attention</text>
      <rect x="364" y="78" width="98" height="26" rx="5" fill={OR} />
      <text x="413" y="96" fontSize="12.5" textAnchor="middle" fill="#fff" style={mono}>Canberra</text>
      <rect x="364" y="112" width="98" height="24" rx="5" fill={CREAM} stroke={INK} strokeWidth="1.5" />
      <text x="413" y="129" fontSize="12" textAnchor="middle" fill={INK} style={mono}>Sydney</text>
      <rect x="364" y="144" width="98" height="24" rx="5" fill={CREAM} stroke={INK} strokeWidth="1.5" />
      <text x="413" y="161" fontSize="12" textAnchor="middle" fill={INK} style={mono}>Melbourne</text>
      <path d="M352 172v-80h8" stroke={INK} strokeWidth="1.6" fill="none" />
      <text x="44" y="94" fontSize="11" fill={INK} opacity=".55" style={mono}>tokens</text>
    </g>,
  );
}

export function ArtMobileBig() {
  return frame(
    <g>
      <g transform="translate(30 16) rotate(-3)">
        <rect width="136" height="266" rx="24" fill={CREAM} stroke={INK} strokeWidth="2.5" />
        <rect x="48" y="10" width="40" height="7" rx="3.5" fill={INK} opacity=".2" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="14" y={40 + i * 46} width="108" height="36" rx="9" fill={SAND} stroke={INK} strokeWidth="1.8" />
            <rect x="24" y={52 + i * 46} width={64 - i * 14} height="7" rx="3.5" fill={INK} opacity=".3" />
            <circle cx="104" cy={58 + i * 46} r="5" fill={i === 0 ? "#23885a" : i === 1 ? OR : "#c9c5bc"} stroke={INK} strokeWidth="1.2" />
          </g>
        ))}
        <rect x="14" y="204" width="108" height="40" rx="20" fill={OR} stroke={INK} strokeWidth="2.2" />
        <text x="68" y="229" fontSize="14" textAnchor="middle" fill="#fff" style={{ ...sans, fontWeight: 600 }}>Save offline</text>
      </g>
      <path d="M184 150h70" stroke={INK} strokeWidth="2.4" strokeDasharray="6 6" fill="none" />
      <path d="M248 140l14 10-14 10" stroke={INK} strokeWidth="2.4" fill="none" />
      <text x="190" y="136" fontSize="10.5" fill={INK} opacity=".6" style={mono}>no signal</text>
      {[["job_001", "CREATE"], ["job_002", "UPDATE"], ["job_003", "SYNC"]].map(([a, b], i) => (
        <g key={a} transform={`translate(${284 + (i % 2 ? 10 : 0)} ${22 + i * 54})`}>
          <rect width="208" height="44" rx="10" fill={CREAM} stroke={INK} strokeWidth="2" />
          <circle cx="24" cy="22" r="7" fill={i === 0 ? "#23885a" : i === 1 ? OR : "#c9c5bc"} stroke={INK} strokeWidth="1.5" />
          <text x="42" y="27" fontSize="13" fill={INK} style={mono}>{a}</text>
          <text x="196" y="27" fontSize="10.5" textAnchor="end" fill={INK} opacity=".6" style={mono}>{b}</text>
        </g>
      ))}
      <path d="M390 188v22" stroke={INK} strokeWidth="2.4" /><path d="M382 204l8 10 8-10" stroke={INK} strokeWidth="2.4" fill="none" />
      <g transform="translate(390 252)">
        <path d="M-62 0v22c0 8 28 14 62 14s62-6 62-14V0" fill={SAND} stroke={INK} strokeWidth="2.2" />
        <ellipse rx="62" ry="14" fill={CREAM} stroke={INK} strokeWidth="2.2" />
        <text y="26" fontSize="12" textAnchor="middle" fill={INK} style={mono}>SQLite</text>
      </g>
    </g>,
  );
}

export function ArtPractice() {
  return frame(
    <g>
      <g transform="rotate(-3 260 120)">
        <rect x="60" y="22" width="400" height="168" rx="8" fill={CREAM} stroke={INK} strokeWidth="2.4" />
        <path d="M76 56h368" stroke={OR} strokeWidth="2" />
        <path d="M76 82h368M76 108h368" stroke="#9aa7d0" strokeWidth="1" />
        <text x="84" y="46" fontSize="12" fill={INK} opacity=".6" style={mono}>problem 3 · recall@4</text>
        <text x="84" y="150" fontSize="44" fontStyle="italic" fill={INK} style={serif}>0.617</text>
        <g transform="translate(330 112)">
          <rect width="104" height="46" rx="10" fill={CREAM} stroke={INK} strokeWidth="2.2" />
          <text x="52" y="30" fontSize="16" textAnchor="middle" fill={INK} style={{ ...sans, fontWeight: 600 }}>Check ✓</text>
        </g>
      </g>
      <g transform="translate(60 206)">
        {["today", "tomorrow", "this week"].map((t, i) => (
          <g key={t} transform={`translate(${i * 128} 0)`}>
            <rect width="116" height="66" rx="10" fill={i === 0 ? "#ffd9c7" : SAND} stroke={INK} strokeWidth="2" />
            <text x="12" y="24" fontSize="12.5" fill={INK} style={mono}>{t}</text>
            {[0, 1, 2, 3].map((d) => <circle key={d} cx={20 + d * 22} cy="46" r="6" fill={d < 3 - i ? OR : "none"} stroke={INK} strokeWidth="1.5" strokeDasharray={d < 3 - i ? "" : "3 3"} />)}
          </g>
        ))}
      </g>
    </g>,
  );
}

export function ArtBuild() {
  return frame(
    <g>
      <rect x="26" y="20" width="468" height="262" rx="14" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <rect x="26" y="20" width="468" height="262" rx="14" fill="url(#grid)" />
      {["TypeScript", "Kotlin", "Java"].map((t, i) => (
        <g key={t} transform={`translate(${46 + i * 108} 36)`}>
          <rect width="100" height="32" rx="16" fill={i === 1 ? OR : CREAM} stroke={INK} strokeWidth="2" />
          <text x="50" y="21" fontSize="13" textAnchor="middle" fill={i === 1 ? "#fff" : INK} style={{ ...sans, fontWeight: 600 }}>{t}</text>
        </g>
      ))}
      {[["fun pairSum(nums: IntArray, k: Int) {", 0], ["  var lo = 0; var hi = nums.size - 1", 1], ["  while (lo < hi) {", 1], ["    val s = nums[lo] + nums[hi]", 2], ["    if (s == k) return lo to hi", 2], ["    if (s < k) lo++ else hi--", 2], ["  }", 1], ["}", 0]].map(([t, d], i) => (
        <text key={i} x="46" y={100 + i * 21} fontSize="12.5" fill={INK} opacity={i === 4 ? 1 : 0.8} style={mono}>{t as string}</text>
      ))}
      <rect x="40" y="153" width="290" height="22" fill="#ffe3d6" opacity=".7" />
      <g transform="translate(350 214)">
        <rect width="124" height="42" rx="21" fill="#cfe9dc" stroke={INK} strokeWidth="2.2" />
        <text x="62" y="27" fontSize="14" textAnchor="middle" fill={INK} style={mono}>tests 15/15</text>
      </g>
    </g>,
  );
}

export function ArtInterview() {
  const stops = [["Screen", 70, 210], ["Coding", 160, 120], ["Design", 270, 190], ["People", 370, 110], ["Offer", 450, 180]] as const;
  return frame(
    <g>
      <rect x="20" y="20" width="480" height="260" rx="14" fill={CREAM} stroke={INK} strokeWidth="2.5" />
      <rect x="20" y="20" width="480" height="260" rx="14" fill="url(#grid)" />
      <path d="M70 210C100 130 130 110 160 120S230 210 270 190 330 100 370 110 430 190 450 180" stroke={OR} strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" fill="none" />
      {stops.map(([t, x, y], i) => (
        <g key={t}>
          <circle cx={x} cy={y} r="17" fill={i === 4 ? OR : CREAM} stroke={INK} strokeWidth="2.4" />
          <text x={x} y={y + 5} fontSize="13" textAnchor="middle" fill={i === 4 ? "#fff" : INK} style={mono}>{i + 1}</text>
          <text x={x} y={y + 38} fontSize="12.5" textAnchor="middle" fill={INK} style={mono}>{t}</text>
        </g>
      ))}
      <g transform="translate(40 40)">
        <rect width="86" height="30" rx="15" fill="#ffd9c7" stroke={INK} strokeWidth="2" />
        <text x="43" y="20" fontSize="13" textAnchor="middle" fill={INK} style={mono}>45:00</text>
      </g>
      <text x="360" y="52" fontSize="26" fontStyle="italic" fill={INK} style={serif}>five rounds</text>
    </g>,
  );
}
