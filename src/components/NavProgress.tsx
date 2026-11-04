"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Shows a progress bar the instant an internal link is clicked, so every click feels acknowledged. */
export function NavProgress() {
  const path = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const last = useRef(path);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      setState("loading");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (path === last.current) return;
    last.current = path;
    setState("done");
    const t = setTimeout(() => setState("idle"), 300);
    return () => clearTimeout(t);
  }, [path]);

  return <div className={"nav-progress " + state} aria-hidden />;
}
