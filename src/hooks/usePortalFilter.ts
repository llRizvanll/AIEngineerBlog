"use client";

import { useCallback, useMemo, useState } from "react";
import type { FilterState, PortalAsset } from "@/types/portal";

export const initialFilterState: FilterState = { searchQuery: "" };

export function matchesFilters(asset: PortalAsset, f: FilterState): boolean {
  const query = f.searchQuery.trim().toLowerCase();
  if (query) {
    const haystack = `${asset.title} ${asset.curationMetadata.contextualCommentary} ${asset.compositeTags.join(" ")} ${asset.format} ${asset.domain}`.toLowerCase();
    // Every word must match, in any order, so "kv cache batching" still finds results.
    if (!query.split(/\s+/).every((word) => haystack.includes(word))) return false;
  }
  if (f.domain && asset.domain !== f.domain) return false;
  if (f.mode && asset.mode !== f.mode) return false;
  if (f.format && asset.format !== f.format) return false;
  if (f.cognitiveLevel && asset.cognitiveLevel !== f.cognitiveLevel) return false;
  if (f.complexityTier && asset.complexityTier !== f.complexityTier) return false;
  if (f.durationCategory && asset.estimatedDuration.category !== f.durationCategory) return false;
  if (f.selectedTag && !asset.compositeTags.includes(f.selectedTag)) return false;
  if (f.curriculum && asset.curriculum !== f.curriculum) return false;
  return true;
}

export function usePortalFilter(assets: PortalAsset[], initial: FilterState = initialFilterState) {
  const [filters, setFilters] = useState<FilterState>(initial);

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);
  const resetFilters = useCallback(() => setFilters(initialFilterState), []);

  const filteredAssets = useMemo(() => assets.filter((a) => matchesFilters(a, filters)), [assets, filters]);

  const activeFilterCount = useMemo(() => Object.entries(filters).filter(([, v]) => v !== undefined && v !== "").length, [filters]);

  return { filters, setFilter, setFilters, resetFilters, filteredAssets, activeFilterCount, totalCount: assets.length };
}

export type PortalFilterController = ReturnType<typeof usePortalFilter>;
