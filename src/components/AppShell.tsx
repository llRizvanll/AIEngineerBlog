"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavGroup } from "@/lib/nav-types";
void (null as unknown as NavGroup);
import { defaultPrefs, PREFS_KEY, useLocal, type Prefs } from "@/lib/store";
import { Icon } from "./Icons";
import { openSearch } from "./Masthead";
import { SearchIcon } from "./SearchIcon";
import { Settings } from "./Settings";

/* The rail: where you go. Each entry is a hub that lists everything beneath it. */
const RAIL: { id: string; label: string; href: string; icon: string; match: string[] }[] = [
  { id: "learn", label: "Learn", href: "/learn", icon: "book", match: ["/learn", "/aiengine", "/modules", "/deep", "/protocols", "/series", "/mobile", "/explore"] },
  { id: "tracks", label: "Tracks", href: "/tracks", icon: "route", match: ["/tracks", "/paths/react-native", "/paths/mobile-principal"] },
  { id: "projects", label: "Projects", href: "/mobile-coding", icon: "code", match: ["/mobile-coding", "/coding"] },
  { id: "practice", label: "Practice", href: "/practice", icon: "target", match: ["/practice", "/revise", "/reels", "/paths/ai-interviews/basics"] },
  { id: "interview", label: "Interview", href: "/interviews", icon: "chat", match: ["/interviews", "/interview", "/paths/ai-interviews", "/problem-solving"] },
  { id: "progress", label: "Progress", href: "/library", icon: "user", match: ["/library"] },
];

const on = (path: string, m: string[]) => m.some((h) => path === h || path.startsWith(h + "/"));
const railFor = (path: string) => {
  // The more specific match wins: /paths/ai-interviews/basics is Practice, not Interview.
  const hits = RAIL.map((r) => ({ r, len: Math.max(0, ...r.match.filter((h) => path === h || path.startsWith(h + "/")).map((h) => h.length)) })).filter((x) => x.len);
  return hits.sort((a, b) => b.len - a.len)[0]?.r;
};

export function Chrome({ groups }: { groups?: NavGroup[] }) {
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
    const open = () => setSettings(true);
    window.addEventListener("pae-appearance", open);
    return () => window.removeEventListener("pae-appearance", open);
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
        <button type="button" className="tb-search" onClick={openSearch} aria-label="Search everything">
          <SearchIcon size={16} /> <span>Search lessons and projects</span> <kbd>⌘K</kbd>
        </button>
        <button type="button" className="tb-icon" onClick={flip} aria-label="Switch between light and dark">
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
        <Link href="/learn">Learn</Link>
        <Link href="/practice">Practice</Link>
        <Link href="/interviews">Interview</Link>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="ln-act">
        <button type="button" onClick={openSearch} aria-label="Search everything" className="ln-s">
          <SearchIcon size={17} />
        </button>
        <Link href="/learn" className="btn ln-btn">
          Your dashboard
        </Link>
      </div>
    </header>
  );
}
