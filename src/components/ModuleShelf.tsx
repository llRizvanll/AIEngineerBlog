import Link from "next/link";
import { modulesByFormat, MODULES, type ModuleDoc } from "@/content/modules";
import { TIER_LABEL } from "@/types/portal";

export function ModuleCard({ m }: { m: ModuleDoc }) {
  return (
    <Link href={`/modules/${m.assetId}`} className={`mod-card d-${m.domain}`}>
      <span className="mc-tier">
        {TIER_LABEL[m.complexityTier]} · {m.minutes} min
      </span>
      <b>{m.title}</b>
      <span className="mc-why">{m.commentary}</span>
    </Link>
  );
}

/** Lists the AI systems modules of one format on that format's index page. */
export function ModuleShelf({ format, title, blurb }: { format?: ModuleDoc["format"]; title: string; blurb?: string }) {
  const list = format ? modulesByFormat(format) : MODULES;
  if (!list.length) return null;
  return (
    <section className="mod-shelf" id="ai-systems">
      <div className="section-h">
        <h2>{title}</h2>
        {blurb && <span>{blurb}</span>}
      </div>
      <div className="mod-grid">
        {list.map((m) => (
          <ModuleCard key={m.assetId} m={m} />
        ))}
      </div>
    </section>
  );
}
