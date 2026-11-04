"use client";

import { SearchIcon } from "./SearchIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, openSearch } from "./Masthead";

const TABS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/interview", label: "Rounds", icon: "◧" },
  { href: "/reels", label: "Reels", icon: "▶" },
  { href: "/aiengine", label: "Learn", icon: "◎" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={isActive(path, t.href) ? "on" : undefined}>
          <i aria-hidden>{t.icon}</i>
          {t.label}
        </Link>
      ))}
      <button type="button" onClick={openSearch}>
        <i aria-hidden><SearchIcon size={18} /></i>Search
      </button>
    </nav>
  );
}
