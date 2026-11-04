"use client";

import { openMenu, openSearch } from "./Masthead";
import { SearchIcon } from "./SearchIcon";
import { Icon } from "./Icons";

export function HeroSearch() {
  return (
    <button type="button" className="hm-search" onClick={openSearch}>
      <SearchIcon size={18} />
      <em>Search anything: a concept, a question, a problem…</em>
      <kbd>⌘K</kbd>
    </button>
  );
}

export function ExploreButton() {
  return (
    <button type="button" className="btn ghost" onClick={openMenu}>
      <Icon name="grid" size={16} /> Explore everything
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
