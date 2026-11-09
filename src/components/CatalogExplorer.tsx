"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePortalFilter } from "@/hooks/usePortalFilter";
import { DOMAIN_LABEL, FORMAT_LABEL, TIER_LABEL, type FilterState, type PortalAsset } from "@/types/portal";
import { PortalFilterBar } from "./PortalFilterBar";
import { CATALOG_PAGE_SIZE, CATALOG_FILTER_KEYS, FORMAT_ORDER, TIER_ORDER } from "@/config/constants";
import { CATALOG_COPY } from "@/content/ui-copy";

function readUrl(): FilterState {
  const p = new URLSearchParams(window.location.search);
  const f: FilterState = { searchQuery: p.get("q") ?? "" };
  for (const k of CATALOG_FILTER_KEYS) {
    const v = p.get(k);
    if (v) (f as unknown as Record<string, string>)[k] = v;
  }
  const topic = Number(p.get("topic"));
  if (topic) f.curriculum = topic;
  const tag = p.get("tag");
  if (tag) f.selectedTag = tag;
  return f;
}

function writeUrl(f: FilterState) {
  const p = new URLSearchParams();
  if (f.searchQuery) p.set("q", f.searchQuery);
  for (const k of CATALOG_FILTER_KEYS) if (f[k]) p.set(k, f[k] as string);
  if (f.curriculum) p.set("topic", String(f.curriculum));
  if (f.selectedTag) p.set("tag", f.selectedTag);
  const qs = p.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

const rank = (a: PortalAsset) => FORMAT_ORDER.indexOf(a.format) * 10 + TIER_ORDER.indexOf(a.complexityTier);

export function CatalogExplorer() {
  const [assets, setAssets] = useState<PortalAsset[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [limit, setLimit] = useState(CATALOG_PAGE_SIZE);
  const sorted = useMemo(() => (assets ? [...assets].sort((a, b) => rank(a) - rank(b)) : []), [assets]);
  const ctl = usePortalFilter(sorted);
  const { filters, setFilter, setFilters, filteredAssets } = ctl;
  const ready = useRef(false);

  useEffect(() => {
    setFilters(readUrl());
    ready.current = true;
    fetch("/catalog.json")
      .then((r) => r.json())
      .then(setAssets)
      .catch(() => setFailed(true));
  }, [setFilters]);

  useEffect(() => {
    if (ready.current) writeUrl(filters);
    setLimit(CATALOG_PAGE_SIZE);
  }, [filters]);

  return (
    <>
      <PortalFilterBar filterController={ctl} />
      {failed && <p className="empty-card">{CATALOG_COPY.failed}</p>}
      {!assets && !failed && (
        <div className="asset-grid" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="asset-card skeleton" />
          ))}
        </div>
      )}
      {assets && filteredAssets.length === 0 && <p className="empty-card">{CATALOG_COPY.empty}</p>}
      {assets && (
        <div className="asset-grid">
          {filteredAssets.slice(0, limit).map((a) => (
            <article key={a.assetId} className={`asset-card am-${a.mode}`}>
              <Link href={a.href} className="ac-main">
                <span className="ac-kind">
                  {FORMAT_LABEL[a.format]} · {a.estimatedDuration.minutes} min
                </span>
                <b>{a.title}</b>
                <span className="ac-why">{a.curationMetadata.contextualCommentary}</span>
              </Link>
              <div className="ac-foot">
                <button type="button" onClick={() => setFilter("domain", a.domain)}>
                  {DOMAIN_LABEL[a.domain]}
                </button>
                <button type="button" onClick={() => setFilter("complexityTier", a.complexityTier)}>
                  {TIER_LABEL[a.complexityTier].split(" · ")[0]}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {assets && filteredAssets.length > limit && (
        <p className="ac-more">
          <button type="button" className="btn ghost" onClick={() => setLimit((l) => l + CATALOG_PAGE_SIZE)}>
            Show {Math.min(CATALOG_PAGE_SIZE, filteredAssets.length - limit)} more
          </button>
        </p>
      )}
    </>
  );
}
