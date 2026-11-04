"use client";

import { SearchIcon } from "./SearchIcon";
import { openSearch } from "./Masthead";

export function HomeSearch() {
  return (
    <button type="button" className="hm-search" onClick={openSearch}>
      <SearchIcon size={18} />
      <em>Search posts, rounds, protocols, concepts…</em>
      <kbd>⌘K</kbd>
    </button>
  );
}
