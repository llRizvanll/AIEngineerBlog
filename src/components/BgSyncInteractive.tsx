"use client";

import { useEffect } from "react";
import { Reading } from "./Reading";
import { mountBackgroundSync } from "@/lib/bgsync";

/** Part 1 is authored HTML; this wires up its tabs, chooser, calculator, myths, quiz and simulator. */
export function BgSyncInteractive({ html, title }: { html: string; title: string }) {
  useEffect(() => {
    const root = document.getElementById("article");
    if (!root) return;
    return mountBackgroundSync(root);
  }, []);
  return <Reading title={title} kind="Post" articleId="article" railTitle="In this post" html={html} />;
}
