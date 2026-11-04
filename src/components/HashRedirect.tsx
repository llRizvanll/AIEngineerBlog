"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routeFor } from "@/lib/routes";

const OLD = /^(background-sync|post-|case-|deep-|proto-|reels|interview$|revise$|aiengine$|protocols$|library$|home$)/;

/** Keeps links from the original single-page app (/#case-chat) working. */
export function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const h = location.hash.slice(1);
    if (location.pathname === "/" && h && OLD.test(h)) router.replace(routeFor(h));
  }, [router]);
  return null;
}
