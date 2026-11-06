"use client";

import { useState } from "react";
import type { PortalFilterController } from "@/hooks/usePortalFilter";
import { CURRICULUM, DOMAIN_LABEL, DURATION_LABEL, FORMAT_LABEL, LEVEL_LABEL, MODE_LABEL, TIER_LABEL, type AssetFormat, type CognitiveLevel, type ComplexityTier, type Domain, type DurationCategory, type PortalMode } from "@/types/portal";
import { SearchIcon } from "./SearchIcon";

const entries = <K extends string>(o: Record<K, string>) => Object.entries(o) as [K, string][];

/** Level 1: search and mode. Level 2, behind "Filters": domain, topic, format, tier, depth, time. */
export function PortalFilterBar({ filterController }: { filterController: PortalFilterController }) {
  const { filters, setFilter, resetFilters, activeFilterCount, filteredAssets, totalCount } = filterController;
  const [open, setOpen] = useState(false);
  const level2Active = [filters.domain, filters.curriculum, filters.format, filters.complexityTier, filters.cognitiveLevel, filters.durationCategory].filter(Boolean).length;

  return (
    <div className="pf" role="search" aria-label="Filter the catalog">
      <div className="pf-top">
        <label className="pf-search">
          <SearchIcon size={17} />
          <span className="vh">Search the catalog</span>
          <input type="search" value={filters.searchQuery} onChange={(e) => setFilter("searchQuery", e.target.value)} placeholder="Search KV cache, HNSW, outbox, LoRA…" />
        </label>
        <div className="pf-modes" role="group" aria-label="Mode">
          {entries(MODE_LABEL).map(([mode, label]) => (
            <button key={mode} type="button" className={`pf-m-${mode}`} aria-pressed={filters.mode === mode} onClick={() => setFilter("mode", filters.mode === mode ? undefined : (mode as PortalMode))}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="pf-more" aria-expanded={open} aria-controls="pf-level2" onClick={() => setOpen((o) => !o)}>
          Filters{level2Active ? ` (${level2Active})` : ""}
        </button>
      </div>

      {open && (
        <div className="pf-level2" id="pf-level2">
          <label>
            <span>Domain</span>
            <select value={filters.domain ?? ""} onChange={(e) => setFilter("domain", (e.target.value as Domain) || undefined)}>
              <option value="">All domains</option>
              {entries(DOMAIN_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Topic</span>
            <select value={filters.curriculum ?? ""} onChange={(e) => setFilter("curriculum", e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">All topics</option>
              {CURRICULUM.map((c) => (
                <option key={c.n} value={c.n}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Format</span>
            <select value={filters.format ?? ""} onChange={(e) => setFilter("format", (e.target.value as AssetFormat) || undefined)}>
              <option value="">All formats</option>
              {entries(FORMAT_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Complexity</span>
            <select value={filters.complexityTier ?? ""} onChange={(e) => setFilter("complexityTier", (e.target.value as ComplexityTier) || undefined)}>
              <option value="">All tiers</option>
              {entries(TIER_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Thinking level</span>
            <select value={filters.cognitiveLevel ?? ""} onChange={(e) => setFilter("cognitiveLevel", (e.target.value as CognitiveLevel) || undefined)}>
              <option value="">All levels</option>
              {entries(LEVEL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Time</span>
            <select value={filters.durationCategory ?? ""} onChange={(e) => setFilter("durationCategory", (e.target.value as DurationCategory) || undefined)}>
              <option value="">Any length</option>
              {entries(DURATION_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="pf-status" aria-live="polite">
        <span>
          Showing <b>{filteredAssets.length}</b> of {totalCount}
        </span>
        {filters.selectedTag && (
          <button type="button" className="pf-tag" onClick={() => setFilter("selectedTag", undefined)}>
            {filters.selectedTag} ✕
          </button>
        )}
        {activeFilterCount > 0 && (
          <button type="button" className="pf-clear" onClick={resetFilters}>
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>
    </div>
  );
}
