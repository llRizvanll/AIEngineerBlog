"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routeFor } from "@/lib/routes";
import { LEGACY_HASH } from "@/config/constants";

/** Keeps links from the original single-page app (/#case-chat) working. */
export function HashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const h = location.hash.slice(1);
    if (location.pathname === "/" && h && LEGACY_HASH.test(h)) router.replace(routeFor(h));
  }, [router]);
  return null;
}
