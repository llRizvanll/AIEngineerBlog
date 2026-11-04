"use client";

import { SearchIcon } from "./SearchIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Settings } from "./Settings";

export const NAV: { href: string; label: string; icon: string }[] = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/series", label: "Series", icon: "✎" },
  { href: "/aiengine", label: "AIEngine", icon: "◎" },
  { href: "/protocols", label: "Protocols", icon: "⇄" },
  { href: "/interview", label: "System design", icon: "◧" },
  { href: "/coding", label: "Coding", icon: "{}" },
  { href: "/problem-solving", label: "Behavioral", icon: "◉" },
  { href: "/deep", label: "Deep dives", icon: "◇" },
  { href: "/revise", label: "Revise", icon: "✓" },
  { href: "/reels", label: "Reels", icon: "▶" },
];

const SERIES_ACTIVE = (_p: string) => false;

export function isActive(path: string, href: string) {
  if (href === "/") return path === "/" || SERIES_ACTIVE(path);
  if (href === "/coding" && path.startsWith("/mobile-coding")) return true;
  return path === href || path.startsWith(href + "/");
}

export function openSearch() {
  window.dispatchEvent(new Event("pae-search"));
}

export function Masthead() {
  const path = usePathname();
  const [settings, setSettings] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8); // React skips the render when the value is unchanged
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setSettings(false), [path]);

  return (
    <header className={"mast" + (scrolled ? " scrolled" : "")}>
      <div className="wrap">
        <Link className="logo" href="/">
          <span className="logo-mark" aria-hidden>
            AI
          </span>
          <b>
            <span>AI</span> Engineer
          </b>
        </Link>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={isActive(path, n.href) ? "cur" : undefined} aria-current={isActive(path, n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mast-act">
          <button type="button" id="mast-search" onClick={openSearch} aria-label="Search everything">
            <SearchIcon size={18} /> <em>Search</em> <kbd>⌘K</kbd>
          </button>
          <Link href="/library" aria-label="My library" title="My library" className={path === "/library" ? "cur" : undefined}>
            ☆
          </Link>
          <button type="button" aria-label="Appearance: theme, palette and fonts" title="Appearance" aria-expanded={settings} onClick={() => setSettings((s) => !s)}>
            Aa
          </button>
        </div>
      </div>
      <ReadingProgress />
      <Settings open={settings} onClose={() => setSettings(false)} />
    </header>
  );
}

function ReadingProgress() {
  const path = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const art = document.querySelector<HTMLElement>("[data-reading]");
      let pct = 0;
      if (art) {
        const r = art.getBoundingClientRect();
        const total = art.offsetHeight - window.innerHeight;
        pct = Math.min(1, Math.max(0, -r.top / (total > 0 ? total : 1)));
      }
      if (bar.current) bar.current.style.transform = `scaleX(${pct})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [path]);
  return <div className="progress" ref={bar} />;
}
