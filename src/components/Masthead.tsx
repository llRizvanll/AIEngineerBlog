"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { NavGroup, NavItem } from "@/lib/nav-types";
import { Icon } from "./Icons";
import { SearchIcon } from "./SearchIcon";
import { Settings } from "./Settings";

export function isActive(path: string, href: string, match: string[] = []) {
  if (href === "/") return path === "/";
  return [href, ...match].some((h) => path === h || path.startsWith(h + "/"));
}

export function openSearch() {
  window.dispatchEvent(new Event("pae-search"));
}

export function openMenu() {
  window.dispatchEvent(new Event("pae-menu"));
}

const itemActive = (path: string, it: NavItem) => isActive(path, it.href, it.match);

export function Masthead({ groups }: { groups: NavGroup[] }) {
  const path = usePathname();
  const [settings, setSettings] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedBy = useRef<"hover" | "click" | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Close everything on navigation.
  useEffect(() => {
    setSettings(false);
    openedBy.current = null;
    setOpen(null);
    setSheet(false);
  }, [path]);

  useEffect(() => {
    const showSheet = () => setSheet(true);
    const showAppearance = () => setSettings(true);
    window.addEventListener("pae-appearance", showAppearance);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        openedBy.current = null;
        setOpen(null);
        setSheet(false);
      }
    };
    const outside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        openedBy.current = null;
        setOpen(null);
      }
    };
    window.addEventListener("pae-menu", showSheet);
    window.addEventListener("keydown", key);
    document.addEventListener("mousedown", outside);
    return () => {
      window.removeEventListener("pae-menu", showSheet);
      window.removeEventListener("pae-appearance", showAppearance);
      window.removeEventListener("keydown", key);
      document.removeEventListener("mousedown", outside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = sheet ? "hidden" : "";
  }, [sheet]);

  const hover = useCallback((id: string | null) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      if (id === null && openedBy.current === "click") return; // a clicked menu stays until clicked away
      openedBy.current = id ? openedBy.current ?? "hover" : null;
      setOpen(id);
    }, id ? 90 : 160);
  }, []);

  const current = groups.find((g) => g.id === open);

  return (
    <header className={"mast" + (scrolled ? " scrolled" : "") + (open ? " menu-open" : "")}>
      <div className="wrap">
        <Link className="logo" href="/">
          <span className="logo-mark" aria-hidden>
            AI
          </span>
          <b>
            <span>AI</span> Engineer
          </b>
        </Link>

        <nav aria-label="Main" ref={navRef} className="mega-nav" onMouseLeave={() => hover(null)}>
          <Link href="/" className={"nav-top" + (path === "/" ? " cur" : "")} aria-current={path === "/" ? "page" : undefined}>
            Home
          </Link>
          {groups.map((g) => {
            const active = g.items.some((it) => itemActive(path, it));
            return (
              <button
                key={g.id}
                type="button"
                className={"nav-top" + (active ? " cur" : "") + (open === g.id ? " open" : "")}
                aria-expanded={open === g.id}
                aria-controls={`mega-${g.id}`}
                onMouseEnter={() => hover(g.id)}
                onClick={() => {
                  if (hoverTimer.current) clearTimeout(hoverTimer.current);
                  // A click after hover pins the menu open; a second click closes it.
                  if (open === g.id && openedBy.current === "click") {
                    openedBy.current = null;
                    setOpen(null);
                  } else {
                    openedBy.current = "click";
                    setOpen(g.id);
                  }
                }}
              >
                {g.label}
                <Icon name="chevron" size={14} />
              </button>
            );
          })}

          <Link href="/explore" className={"nav-top" + (isActive(path, "/explore") ? " cur" : "")} aria-current={isActive(path, "/explore") ? "page" : undefined} onMouseEnter={() => hover(null)}>
            Explore
          </Link>

          {current && (
            <div className="mega" id={`mega-${current.id}`} onMouseEnter={() => hover(current.id)} role="region" aria-label={current.label}>
              <div className="mega-intro">
                <span className="eyebrow">{current.label}</span>
                <p>{current.blurb}</p>
                <button type="button" className="mega-search" onClick={openSearch}>
                  <SearchIcon size={15} /> Search everything <kbd>⌘K</kbd>
                </button>
              </div>
              <div className="mega-grid">
                {current.items.map((it) => (
                  <MenuCard key={it.href} it={it} active={itemActive(path, it)} />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="mast-act">
          <button type="button" id="mast-search" onClick={openSearch} aria-label="Search everything">
            <SearchIcon size={17} /> <em>Search</em> <kbd>⌘K</kbd>
          </button>
          <button type="button" aria-label="Appearance: theme, palette and fonts" title="Appearance" aria-expanded={settings} onClick={() => setSettings((s) => !s)}>
            Aa
          </button>
          <button type="button" className="burger" aria-label="Open menu" aria-expanded={sheet} onClick={() => setSheet(true)}>
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
      <ReadingProgress />
      <Settings open={settings} onClose={() => setSettings(false)} />
      {sheet && createPortal(<MenuSheet groups={groups} path={path} onClose={() => setSheet(false)} />, document.body)}
    </header>
  );
}

function MenuCard({ it, active }: { it: NavItem; active: boolean }) {
  return (
    <Link href={it.href} className={"mcard" + (active ? " cur" : "")} style={{ "--c1": it.color[0], "--c2": it.color[1] } as CSSProperties}>
      <span className="mcard-ic">
        <Icon name={it.icon} size={19} />
      </span>
      <span className="mcard-tx">
        {it.level && <i className="mc-level">{it.level}</i>}
        <b>
          {it.title}
          {it.count && <small>{it.count}</small>}
        </b>
        <span>{it.desc}</span>
      </span>
    </Link>
  );
}

function MenuSheet({ groups, path, onClose }: { groups: NavGroup[]; path: string; onClose: () => void }) {
  return (
    <div className="sheet-ov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="sheet-head">
          <Link className="logo" href="/" onClick={onClose}>
            <span className="logo-mark" aria-hidden>
              AI
            </span>
            <b>
              <span>AI</span> Engineer
            </b>
          </Link>
          <button type="button" className="sheet-x" onClick={onClose} aria-label="Close menu">
            <Icon name="close" size={20} />
          </button>
        </div>
        <button
          type="button"
          className="sheet-search"
          onClick={() => {
            onClose();
            openSearch();
          }}
        >
          <SearchIcon size={17} /> Search everything
        </button>
        <Link href="/" className={"sheet-home" + (path === "/" ? " cur" : "")}>
          <Icon name="home" size={18} /> Home
        </Link>
        <Link href="/explore" className={"sheet-home" + (path === "/explore" ? " cur" : "")}>
          <Icon name="grid" size={18} /> Explore the catalog
        </Link>
        {groups.map((g) => (
          <section key={g.id} className="sheet-group">
            <h3>{g.label}</h3>
            {g.items.map((it) => (
              <MenuCard key={it.href} it={it} active={itemActive(path, it)} />
            ))}
          </section>
        ))}
      </div>
    </div>
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
