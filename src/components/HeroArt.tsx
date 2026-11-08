/* Flat line illustrations for the landing page. Fixed colours on purpose: they read as objects on the desk, in light and dark. */

const INK = "#1d1c1a";
const OR = "#ff5a1f";
const mono = { fontFamily: "var(--font-mono)" } as const;

function Notebook({ x, y, rot, tone, label, sub, children }: { x: number; y: number; rot: number; tone: string; label: string; sub: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="132" y="34" width="22" height="64" rx="9" fill={tone} stroke={INK} strokeOpacity=".25" />
      <rect x="0" y="0" width="146" height="186" rx="12" fill={tone} stroke={INK} strokeOpacity=".3" />
      <rect x="0" y="0" width="146" height="186" rx="12" fill="url(#dots)" />
      <text x="12" y="20" fontSize="9.5" fill={INK} style={mono}>{label}</text>
      <text x="12" y="32" fontSize="5.5" fill={INK} opacity=".6" style={mono}>{sub}</text>
      <rect x="14" y="44" width="118" height="118" rx="6" fill="#fcfbf8" stroke={INK} strokeWidth="2" />
      <g transform="translate(14 44)">{children}</g>
    </g>
  );
}

const Defs = () => (
  <defs>
    <pattern id="dots" width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r=".6" fill={INK} opacity=".16" />
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#3c301e" floodOpacity=".25" />
    </filter>
  </defs>
);

export function HeroLeft() {
  return (
    <svg viewBox="0 0 330 470" role="img" aria-label="" width="100%" filter="url(#soft)">
      <Defs />
      <g filter="url(#soft)">
        <Notebook x={96} y={8} rot={6} tone="#d9d0ea" label="PROBABILITY" sub="count it, then weigh it">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={20 + i * 13} cy={92 - (i < 4 ? i : 6 - i) * 14} r="3.2" fill={INK} />
          ))}
          <path d="M10 100h98" stroke={INK} strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={13 + i * 13} y={100 - [6, 12, 20, 26, 20, 12, 6][i]} width="8" height={[6, 12, 20, 26, 20, 12, 6][i]} fill="none" stroke={INK} strokeWidth="1.4" />
          ))}
        </Notebook>
        <Notebook x={8} y={36} rot={-7} tone="#bfe0d8" label="CLASSICAL ML" sub="models that learn from tables">
          {[[22, 24], [34, 50], [20, 74], [46, 36], [30, 92], [58, 62], [70, 28], [84, 54], [74, 86], [96, 40]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3.4" fill={i % 4 === 0 ? INK : "none"} stroke={INK} strokeWidth="1.5" />
          ))}
          <path d="M52 8v100M52 58h60M80 58v50" stroke={INK} strokeWidth="1.6" fill="none" />
          <circle cx="104" cy="96" r="5" fill={OR} />
        </Notebook>
        <Notebook x={52} y={150} rot={-2} tone="#ebc7bf" label="NETWORKS" sub="how a network learns">
          {[[14, 30], [14, 56], [14, 82]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="5" fill="#fcfbf8" stroke={INK} strokeWidth="1.6" />)}
          {[[48, 20], [48, 44], [48, 68], [48, 92]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="5" fill="#fcfbf8" stroke={INK} strokeWidth="1.6" />)}
          {[[82, 40], [82, 74]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="5" fill="#fcfbf8" stroke={INK} strokeWidth="1.6" />)}
          {[30, 56, 82].flatMap((a) => [20, 44, 68, 92].map((b) => <path key={`${a}-${b}`} d={`M19 ${a}L43 ${b}`} stroke={INK} strokeWidth=".7" />))}
          {[20, 44, 68, 92].flatMap((a) => [40, 74].map((b) => <path key={`${a}-${b}`} d={`M53 ${a}L77 ${b}`} stroke={INK} strokeWidth=".7" />))}
          <circle cx="104" cy="56" r="9" fill={OR} stroke={INK} strokeWidth="1.6" />
        </Notebook>
      </g>
      <g transform="translate(6 352) rotate(-4)" filter="url(#soft)">
        <rect x="0" y="40" width="250" height="84" rx="22" fill="#2f6a4f" stroke={INK} strokeOpacity=".4" />
        <rect x="8" y="48" width="234" height="22" rx="10" fill="#3c7f61" />
        {[["Probability", 14, "#d9d0ea"], ["Tokens", 110, "#ebc7bf"], ["Classical ML", 72, "#bfe0d8"]].map(([t, x, c], i) => (
          <g key={t as string} transform={`translate(${x} ${i === 1 ? 14 : 20 - i * 2})`}>
            <path d="M0 24 q0-14 10-14 h60 q10 0 10 14z" fill={c as string} stroke={INK} strokeOpacity=".35" />
            <text x="40" y="22" fontSize="10" textAnchor="middle" fill={INK} style={mono}>{t as string}</text>
          </g>
        ))}
        <rect x="14" y="62" width="222" height="44" rx="6" fill="#fcfbf8" stroke={INK} strokeOpacity=".35" />
        <path d="M24 78h202" stroke={OR} strokeWidth="1.5" />
        <path d="M24 90h202M24 100h202" stroke="#9aa7d0" strokeWidth="1" />
        <rect x="0" y="84" width="250" height="40" rx="18" fill="#2f6a4f" />
        <rect x="4" y="88" width="242" height="6" rx="3" fill="#3c7f61" />
      </g>
    </svg>
  );
}

export function HeroRight() {
  const sticker = (x: number, y: number, children: React.ReactNode) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="108" height="92" rx="10" fill="#fcfbf8" stroke={INK} strokeWidth="1.6" />
      {children}
    </g>
  );
  return (
    <svg viewBox="0 0 330 620" role="img" aria-label="" width="100%">
      <Defs />
      <g transform="translate(40 10) rotate(5)" filter="url(#soft)">
        <rect x="0" y="0" width="250" height="236" rx="12" fill="#ecd9a6" />
        <rect x="0" y="0" width="250" height="236" rx="12" fill="url(#dots)" />
        {sticker(14, 14, (
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <circle cx="42" cy="38" r="20" /><path d="M42 38V26M42 38l9 6M34 14h16" />
            <rect x="10" y="66" width="88" height="14" rx="7" /><rect x="64" y="69" width="10" height="8" fill={OR} stroke="none" />
          </g>
        ))}
        {sticker(130, 10, (
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <rect x="16" y="12" width="76" height="68" rx="6" />
            {[0, 1, 2, 3, 4].map((r) => Array.from({ length: r + 1 }, (_, c) => <circle key={`${r}${c}`} cx={54 - r * 7 + c * 14} cy={26 + r * 9} r="1.8" fill={INK} stroke="none" />))}
            <path d="M22 80V66M30 80V60M38 80V54M46 80V48M54 80V44M62 80V48M70 80V54M78 80V60M86 80V66" />
          </g>
        ))}
        {sticker(10, 120, (
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <circle cx="54" cy="22" r="6" fill={OR} stroke="none" />
            <circle cx="54" cy="22" r="14" strokeDasharray="3 4" />
            <path d="M18 78h72l-8-26H26z" fill="#fcfbf8" /><path d="M36 52v-10M72 52v-10" />
          </g>
        ))}
        {sticker(130, 116, (
          <g stroke={INK} strokeWidth="1.8" fill="none">
            <rect x="12" y="16" width="84" height="52" rx="5" />
            <path d="M18 44h14l6-16 8 30 8-24 6 10h20" stroke={OR} />
            <circle cx="98" cy="74" r="0" />
          </g>
        ))}
      </g>
      <g transform="translate(6 270)">
        <path d="M-40 30 C 60 -10, 140 40, 240 40" stroke="#2e57b3" strokeWidth="14" fill="none" strokeLinecap="round" opacity=".9" />
        <g transform="translate(86 54) rotate(4)" filter="url(#soft)">
          <rect x="62" y="-10" width="30" height="24" rx="8" fill="#c9cdd4" stroke={INK} strokeOpacity=".4" />
          <rect x="0" y="12" width="182" height="236" rx="18" fill="#fcfbf8" stroke={INK} strokeOpacity=".3" />
          <rect x="62" y="22" width="58" height="8" rx="4" fill="#e6e3dc" />
          <text x="18" y="66" fontSize="9" fill={INK} style={mono}>AI Engineer</text>
          <text x="18" y="112" fontSize="30" fill={INK} style={{ fontFamily: "var(--font-serif)" }}>Mobile</text>
          <text x="18" y="146" fontSize="32" fontStyle="italic" fill={INK} style={{ fontFamily: "var(--font-serif)" }}>Principal</text>
          <rect x="0" y="168" width="182" height="80" rx="0" fill="#e4c9a4" />
          <rect x="18" y="186" width="146" height="44" rx="8" fill="#2b2a27" />
          <text x="40" y="217" fontSize="26" fill="#e9e6df" style={mono}>1</text>
          <text x="72" y="217" fontSize="26" fill={OR} style={mono}>4</text>
          <text x="104" y="217" fontSize="14" fill="#e9e6df" style={mono}>days</text>
        </g>
      </g>
    </svg>
  );
}

/* Card pictures */
const frame = (children: React.ReactNode) => (
  <svg viewBox="0 0 520 300" role="img" aria-label="" width="100%">
    <Defs />
    {children}
  </svg>
);

export function ArtAIBig() {
  return frame(
    <g>
      <path d="M30 18h460a16 16 0 0 1 16 16v170a16 16 0 0 1-16 16H120l-40 38 6-38H30a16 16 0 0 1-16-16V34a16 16 0 0 1 16-16z" fill="#fcfbf8" stroke={INK} strokeWidth="2.5" />
      <text x="44" y="56" fontSize="22" fill={INK} style={{ fontFamily: "var(--font-display)" }}>The capital of Australia is</text>
      <rect x="318" y="38" width="3" height="22" fill={OR} />
      <path d="M40 80c20-10 40 10 60 0s40 10 60 0 40 10 60 0 40 10 60 0 40 10 60 0 40 10 60 0 40 10 60 0" stroke={INK} strokeWidth="2" fill="#efeadd" />
      <rect x="40" y="86" width="430" height="124" fill="#efeadd" />
      {["The", "capital", "of", "Australia", "is"].map((t, i) => (
        <g key={t}>
          <rect x={52 + i * 70} y="172" width={t.length * 8 + 18} height="26" rx="4" fill="#fcfbf8" stroke={INK} strokeWidth="1.6" />
          <text x={61 + i * 70} y="190" fontSize="12" fill={INK} style={mono}>{t}</text>
        </g>
      ))}
      <path d="M90 168c40-70 150-70 230 0" stroke={INK} strokeWidth="2.4" fill="none" />
      <path d="M130 168c30-40 90-40 130 0" stroke={INK} strokeWidth="1" opacity=".4" fill="none" />
      <path d="M300 170c14-30 36-30 46 0" stroke={INK} strokeWidth="2" fill="none" />
      <text x="170" y="116" fontSize="11" fill={INK} style={mono}>attention</text>
      <rect x="352" y="100" width="100" height="28" rx="5" fill={OR} />
      <text x="402" y="119" fontSize="13" textAnchor="middle" fill="#fff" style={mono}>Canberra</text>
      <rect x="352" y="136" width="100" height="26" rx="5" fill="#fcfbf8" stroke={INK} strokeWidth="1.5" />
      <text x="402" y="154" fontSize="12" textAnchor="middle" fill={INK} style={mono}>Sydney</text>
      <rect x="352" y="170" width="100" height="26" rx="5" fill="#fcfbf8" stroke={INK} strokeWidth="1.5" />
      <text x="402" y="188" fontSize="12" textAnchor="middle" fill={INK} style={mono}>Melbourne</text>
      <path d="M340 160V114h8" stroke={INK} strokeWidth="1.6" fill="none" />
      {["−0.95", "−0.71", "0.60", "0.35", "0.68", "0.23", "0.90", "0.06"].map((n, i) => (
        <text key={i} x={52 + (i % 4) * 44} y={108 + Math.floor(i / 4) * 14} fontSize="8.5" fill={INK} opacity=".4" style={mono}>{n}</text>
      ))}
    </g>,
  );
}

export function ArtMobileBig() {
  return frame(
    <g>
      <rect x="22" y="16" width="130" height="268" rx="22" fill="#fcfbf8" stroke={INK} strokeWidth="2.5" />
      <rect x="62" y="26" width="50" height="8" rx="4" fill={INK} opacity=".15" />
      <rect x="38" y="52" width="98" height="30" rx="8" fill={OR} />
      <text x="50" y="72" fontSize="11" fill="#fff" style={mono}>Save note</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="38" y={98 + i * 40} width="98" height="30" rx="8" fill="#efeadd" stroke={INK} strokeOpacity=".3" />
          <rect x="48" y={108 + i * 40} width={60 - i * 10} height="6" rx="3" fill={INK} opacity=".35" />
        </g>
      ))}
      <path d="M160 150h96" stroke={INK} strokeWidth="2.2" strokeDasharray="6 6" fill="none" />
      <path d="M250 142l12 8-12 8" stroke={INK} strokeWidth="2.2" fill="none" />
      <g transform="translate(276 40)">
        <text x="0" y="-6" fontSize="11" fill={INK} style={mono}>offline queue</text>
        {[["job_001", "CREATE", "#fcfbf8"], ["job_002", "UPDATE", "#fcfbf8"], ["job_003", "SYNC", "#fcfbf8"]].map(([a, b, c], i) => (
          <g key={a}>
            <rect x="0" y={i * 44} width="210" height="36" rx="8" fill={c} stroke={INK} strokeWidth="1.8" />
            <circle cx="20" cy={i * 44 + 18} r="5" fill={i === 0 ? "#23885a" : i === 1 ? OR : "#c9c5bc"} />
            <text x="36" y={i * 44 + 23} fontSize="12" fill={INK} style={mono}>{a}: {b}</text>
          </g>
        ))}
        <path d="M105 134v28" stroke={INK} strokeWidth="2" /><path d="M99 156l6 8 6-8" stroke={INK} strokeWidth="2" fill="none" />
        <ellipse cx="105" cy="190" rx="60" ry="14" fill="#efeadd" stroke={INK} strokeWidth="2" />
        <path d="M45 190v50c0 8 27 14 60 14s60-6 60-14v-50" fill="#efeadd" stroke={INK} strokeWidth="2" />
        <text x="105" y="235" fontSize="12" textAnchor="middle" fill={INK} style={mono}>SQLite</text>
      </g>
    </g>,
  );
}

export function ArtPractice() {
  return frame(
    <g>
      <g transform="rotate(-4 200 90)">
        <rect x="90" y="30" width="250" height="110" rx="6" fill="#fcfbf8" stroke={INK} strokeWidth="2.2" />
        <path d="M100 52h230" stroke={OR} strokeWidth="2" />
        <path d="M100 74h230M100 94h230" stroke="#9aa7d0" strokeWidth="1" />
        <text x="130" y="122" fontSize="30" fontStyle="italic" fill={INK} style={{ fontFamily: "var(--font-serif)" }}>4 or 9?</text>
        <text x="42" y="68" fontSize="11" fill={INK} style={mono}>missed</text>
      </g>
      <path d="M80 70c-30 40 10 70 70 80" stroke={OR} strokeWidth="2" strokeDasharray="3 4" fill="none" />
      <g transform="translate(70 150)">
        {["next week", "this week", "tomorrow"].map((t, i) => (
          <g key={t}>
            <rect x={150 - i * 30 + (i === 0 ? 40 : 0)} y={-6 + i * 4} width="92" height="22" rx="4" fill="#efeadd" stroke={INK} strokeWidth="1.6" />
            <text x={158 - i * 30 + (i === 0 ? 40 : 0)} y={10 + i * 4} fontSize="11" fill={INK} style={mono}>{t}</text>
          </g>
        ))}
        <rect x="20" y="18" width="330" height="40" fill="#fcfbf8" stroke={INK} strokeWidth="2" />
        <rect x="20" y="58" width="330" height="62" rx="10" fill="#efeadd" stroke={INK} strokeWidth="2.2" />
        <rect x="150" y="76" width="70" height="22" rx="6" fill="#fcfbf8" stroke={INK} strokeWidth="1.8" />
        <path d="M168 112h34" stroke={INK} strokeWidth="2.2" />
        <text x="-10" y="46" fontSize="11" fill={INK} style={mono}>today</text>
      </g>
    </g>,
  );
}

export function ArtBuild() {
  return frame(
    <g>
      <g transform="translate(150 20)">
        <path d="M0 150l110 56 110-56-110-56z" fill="#fcfbf8" stroke={INK} strokeWidth="2.2" />
        <path d="M0 126l110 56 110-56-110-56z" fill="#efeadd" stroke={INK} strokeWidth="2.2" />
        <path d="M0 102l110 56 110-56-110-56z" fill="#fcfbf8" stroke={INK} strokeWidth="2.2" />
        <path d="M0 78l110 56 110-56-110-56z" fill="#efeadd" stroke={INK} strokeWidth="2.2" />
        <path d="M0 54l110 56 110-56L110-2z" fill="#fcfbf8" stroke={INK} strokeWidth="2.2" />
        <rect x="96" y="14" width="14" height="32" fill={OR} stroke={INK} strokeWidth="1.6" />
        <path d="M240 60v28" stroke={INK} strokeWidth="1.6" /><path d="M234 66l6-8 6 8M234 82l6 8 6-8" stroke={INK} strokeWidth="1.6" fill="none" />
        <text x="252" y="78" fontSize="12" fill={INK} style={mono}>4 blocks</text>
      </g>
      <rect x="20" y="30" width="150" height="30" fill="#fcfbf8" stroke={INK} strokeWidth="2" />
      <text x="30" y="50" fontSize="13" fill={INK} style={mono}>val loss</text>
      <rect x="100" y="30" width="70" height="30" fill="#fcfbf8" stroke={INK} strokeWidth="2" />
      <text x="108" y="50" fontSize="13" fill={OR} style={mono}>&lt; 2.0</text>
      <path d="M60 60L170 100" stroke={INK} strokeWidth="1" />
      <g transform="translate(40 232) rotate(14)">
        <rect x="0" y="0" width="260" height="26" fill="#fcfbf8" stroke={INK} strokeWidth="2" />
        {"First Citizen:".split("").map((c, i) => (
          <text key={i} x={10 + i * 18} y="18" fontSize="14" fill={INK} style={mono}>{c}</text>
        ))}
      </g>
    </g>,
  );
}

export function ArtInterview() {
  return frame(
    <g>
      <rect x="70" y="14" width="380" height="270" rx="4" fill="#fcfbf8" stroke={INK} strokeWidth="6" />
      <path d="M70 120h150M290 14v106h160M200 120v164M330 120v164M200 200h250" stroke={INK} strokeWidth="5" fill="none" />
      {[["Online test", 84, 34], ["Phone round", 214, 34], ["Making a market", 344, 34], ["The final chat", 214, 154], ["Betting games", 344, 154]].map(([t, x, y]) => (
        <text key={t as string} x={x as number} y={y as number} fontSize="12" fill={INK} style={mono}>{t as string}</text>
      ))}
      <path d="M130 270V130c0-30 40-40 60-40h120c20 0 30 30 40 40s40 30 60 60" stroke={OR} strokeWidth="2.2" strokeDasharray="3 5" fill="none" />
      <circle cx="130" cy="270" r="5" fill={OR} />
      <rect x="90" y="150" width="30" height="50" rx="4" fill="#efeadd" stroke={INK} strokeWidth="2" />
      <circle cx="260" cy="214" r="22" fill="#efeadd" stroke={INK} strokeWidth="2" />
      <rect x="360" y="60" width="64" height="30" rx="4" fill="#efeadd" stroke={INK} strokeWidth="2" />
      <text x="392" y="80" fontSize="12" textAnchor="middle" fill={INK} style={mono}>4.5|5.5</text>
      <text x="330" y="268" fontSize="20" fontStyle="italic" fill={INK} style={{ fontFamily: "var(--font-serif)" }}>AI Engineer</text>
    </g>,
  );
}
