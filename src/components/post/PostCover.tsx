import { hashNum, palette } from "@/lib/postStyle";

/** Generated cover art: gradient field, glow, a motif per post and the part number. */
export function PostCover({ id, num, label, compact }: { id: string; num: string; label?: string; compact?: boolean }) {
  const [a, b, c] = palette(id);
  const h = hashNum(id);
  const v = h % 4;
  const W = 1200,
    H = compact ? 640 : 520;
  const g = `pc-${id}-${compact ? "c" : "f"}`;
  const motif = () => {
    if (v === 0)
      return Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={W * 0.74} cy={H * 0.5} r={60 + i * 46} fill="none" stroke="#fff" strokeOpacity={0.32 - i * 0.035} strokeWidth={2} />
      ));
    if (v === 1)
      return Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={W * 0.52 + (i % 3) * 120} y={H * 0.16 + Math.floor(i / 3) * 112} width={96} height={84} rx={18} fill="#fff" fillOpacity={0.08 + ((h >> i) % 4) * 0.06} stroke="#fff" strokeOpacity={0.35} />
      ));
    if (v === 2)
      return Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={`M${W * 0.35} ${H * 0.2 + i * 42} C ${W * 0.55} ${H * 0.05 + i * 42}, ${W * 0.75} ${H * 0.45 + i * 42}, ${W} ${H * 0.25 + i * 42}`}
          fill="none"
          stroke="#fff"
          strokeOpacity={0.12 + i * 0.04}
          strokeWidth={3}
        />
      ));
    return Array.from({ length: 12 }, (_, i) => (
      <rect key={i} x={W * 0.5 + i * 46} y={H * 0.82 - (40 + ((h >> (i % 16)) % 7) * 34)} width={30} height={40 + ((h >> (i % 16)) % 7) * 34} rx={8} fill="#fff" fillOpacity={0.14 + (i % 3) * 0.08} />
    ));
  };
  return (
    <svg className="post-cover" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label ?? "Cover art"} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${g}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`${g}-glow`} cx="0.85" cy="0.1" r="0.6">
          <stop offset="0" stopColor={c} stopOpacity="0.85" />
          <stop offset="1" stopColor={c} stopOpacity="0" />
        </radialGradient>
        <pattern id={`${g}-dots`} width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#fff" fillOpacity="0.22" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${g}-bg)`} />
      <rect width={W} height={H} fill={`url(#${g}-glow)`} />
      <rect width={W * 0.45} height={H} fill={`url(#${g}-dots)`} />
      {motif()}
      <text x={56} y={H - 56} fill="#fff" fillOpacity="0.95" fontSize={compact ? 220 : 200} fontWeight={700} letterSpacing="-12" fontFamily="var(--font-display)">
        {num}
      </text>
    </svg>
  );
}
