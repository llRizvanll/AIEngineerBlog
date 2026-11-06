"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
import { isActive, openSearch } from "./Masthead";
import { SearchIcon } from "./SearchIcon";

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Quick navigation">
      <Link href="/" className={path === "/" ? "on" : undefined}>
        <i aria-hidden>
          <Icon name="home" size={19} />
        </i>
        Home
      </Link>
      <Link href="/explore" className={isActive(path, "/explore") ? "on" : undefined}>
        <i aria-hidden>
          <Icon name="grid" size={19} />
        </i>
        Explore
      </Link>
      <Link href="/reels" className={isActive(path, "/reels") ? "on" : undefined}>
        <i aria-hidden>
          <Icon name="play" size={19} />
        </i>
        Reels
      </Link>
      <Link href="/library" className={isActive(path, "/library") ? "on" : undefined}>
        <i aria-hidden>
          <Icon name="bookmark" size={19} />
        </i>
        Library
      </Link>
      <button type="button" onClick={openSearch}>
        <i aria-hidden>
          <SearchIcon size={19} />
        </i>
        Search
      </button>
    </nav>
  );
}
