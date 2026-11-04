import Link from "next/link";
import type { ReelCollection } from "@/content/types";
import { readMinutes } from "@/lib/content";
import type { CSSProperties } from "react";

export function ReelCourseCard({ c, n }: { c: ReelCollection; n: number }) {
  const style = { "--rbg": c.theme.bg, "--rfg": c.theme.fg, "--rac": c.theme.accent, "--rmu": c.theme.muted } as CSSProperties;
  return (
    <Link className="rc" href={`/reels/${c.id}`} style={style}>
      <div>
        <span className="k">
          Course {String(n).padStart(2, "0")} · {c.reels.length} reels · {readMinutes(c)} min
        </span>
        <h3>{c.title}</h3>
        <p>{c.blurb}</p>
        <ol>
          {c.reels.slice(0, 4).map((r) => (
            <li key={r.id}>{r.title}</li>
          ))}
        </ol>
      </div>
      <span className="go">
        <i>▶</i>Start reading
      </span>
    </Link>
  );
}
