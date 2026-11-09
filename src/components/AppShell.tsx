"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { defaultPrefs, PREFS_KEY, useLocal, type Prefs } from "@/lib/store";
import { Icon } from "./Icons";
import { DASHBOARD_HREF, LANDING_LINKS, RAIL, railFor } from "@/config/navigation";
import { onUiEvent, openSearch, UI_EVENTS } from "@/lib/ui-events";
import { SearchIcon } from "./SearchIcon";
import { Settings } from "./Settings";
import { SHELL_COPY } from "@/content/ui-copy";

export function Chrome() {
  const path = usePathname();
  if (path === "/") return <LandingNav />;
  return <Shell path={path} />;
}

function Shell({ path }: { path: string }) {
  const [settings, setSettings] = useState(false);
  const [page, setPage] = useState("");
  const [stored, update] = useLocal<Prefs>(PREFS_KEY, defaultPrefs);
  const here = railFor(path);

  useEffect(() => {
    const t = setTimeout(() => setPage(document.title.split(" · ")[0].trim()), 60);
    setSettings(false);
    return () => clearTimeout(t);
  }, [path]);
  useEffect(() => {
    return onUiEvent(UI_EVENTS.appearance, () => setSettings(true));
  }, []);

  const dark = typeof document !== "undefined" && (document.documentElement.getAttribute("data-theme") === "dark" || (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches));
  const flip = () => update((p) => ({ ...defaultPrefs, ...p, theme: dark ? "light" : "dark" }));
  const isHub = RAIL.some((r) => r.href === path);

  return (
    <>
      <header className="topbar">
        <Link href="/" className="tb-logo">
          <span className="logo-mark sm">AI</span>
          <b>
            AI <em>Engineer</em>
          </b>
        </Link>
        {here && (
          <>
            <i className="tb-sep">/</i>
            {isHub || !page ? (
              <span className="tb-cur">{here.label}</span>
            ) : (
              <>
                <Link href={here.href} className="tb-crumb">
                  {here.label}
                </Link>
                <i className="tb-sep">/</i>
                <span className="tb-cur tb-page">{page}</span>
              </>
            )}
          </>
        )}
        <button type="button" className="tb-search" onClick={openSearch} aria-label={SHELL_COPY.searchAria}>
          <SearchIcon size={16} /> <span>{SHELL_COPY.searchLabel}</span> <kbd>⌘K</kbd>
        </button>
        <button type="button" className="tb-icon" onClick={flip} aria-label={SHELL_COPY.themeAria}>
          <Icon name="sun" size={18} />
        </button>
      </header>
      <nav className="navrail" aria-label="Main">
        {RAIL.map((r) => (
          <Link key={r.id} href={r.href} className={here?.id === r.id ? "on" : undefined} aria-current={here?.id === r.id ? "page" : undefined}>
            <i>
              <Icon name={r.icon} size={20} />
            </i>
            {r.label}
          </Link>
        ))}
        <button type="button" className="navrail-set" onClick={() => setSettings((s) => !s)} aria-expanded={settings}>
          <i>
            <Icon name="gear" size={20} />
          </i>
          Settings
        </button>
      </nav>
      <Settings open={settings} onClose={() => setSettings(false)} />
    </>
  );
}

function LandingNav() {
  return (
    <header className="ln">
      <Link href="/" className="ln-logo">
        <span className="logo-mark sm">AI</span>
        <b>
          AI <em>Engineer</em>
        </b>
      </Link>
      <nav className="ln-pill" aria-label="Main">
        {LANDING_LINKS.map((l) => (l.href.startsWith("#") ? <a key={l.label} href={l.href}>{l.label}</a> : <Link key={l.label} href={l.href}>{l.label}</Link>))}
      </nav>
      <div className="ln-act">
        <button type="button" onClick={openSearch} aria-label="Search everything" className="ln-s">
          <SearchIcon size={17} />
        </button>
        <Link href={DASHBOARD_HREF} className="btn ln-btn">
          Your dashboard
        </Link>
      </div>
    </header>
  );
}
