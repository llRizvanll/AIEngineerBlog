import Link from "next/link";
import { assetByHref, evidenceFor, outcomeFor } from "@/lib/catalog";
import { DOMAIN_LABEL, FORMAT_LABEL, LEVEL_LABEL, MODE_LABEL, TIER_LABEL, type PortalAsset } from "@/types/portal";

/** The strip under a page title: what this is, how long it takes, what you gain, how to prove it. */
export function AssetMeta({ href, outcome, asset }: { href?: string; outcome?: string; asset?: PortalAsset }) {
  const a = asset ?? (href ? assetByHref(href) : undefined);
  if (!a) return null;
  const evidence = evidenceFor(a);
  return (
    <div className={`asset-meta am-${a.mode}`}>
      <div className="am-chips">
        <span className="am-mode">{MODE_LABEL[a.mode]}</span>
        <span>{FORMAT_LABEL[a.format]}</span>
        <span>{TIER_LABEL[a.complexityTier]}</span>
        <span>{LEVEL_LABEL[a.cognitiveLevel]}</span>
        <span>{a.estimatedDuration.minutes} min</span>
        <Link href={`/explore?domain=${a.domain}`}>{DOMAIN_LABEL[a.domain]}</Link>
      </div>
      <p className="am-outcome">
        <b>You will be able to:</b> {(outcome ?? outcomeFor(a)).replace(/^./, (c) => c.toLowerCase())}
      </p>
      {evidence && (
        <p className="am-evidence">
          <b>Prove it:</b> <Link href={evidence.href}>{evidence.title}</Link>
        </p>
      )}
      {a.curationMetadata.sourceAttribution && (
        <p className="am-source">
          <b>Source:</b> {a.curationMetadata.sourceAttribution}
        </p>
      )}
    </div>
  );
}
