"use client";

import { openSearch } from "./Masthead";
import { SearchIcon } from "./SearchIcon";

export function HeroSearch() {
  return (
    <button type="button" className="hm-search" onClick={openSearch}>
      <SearchIcon size={18} />
      <em>Search a concept, question or problem…</em>
      <kbd>⌘K</kbd>
    </button>
  );
}

export function AppearanceButton() {
  return (
    <button type="button" className="btn" onClick={() => window.dispatchEvent(new Event("pae-appearance"))}>
      Open appearance settings
    </button>
  );
}
