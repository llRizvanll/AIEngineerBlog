"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/track";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PLAUSIBLE = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/** Hosts that send readers from an AI answer. Counting them shows whether LLMs are citing the site. */
const AI_REFERRERS: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
  [/(^|\.)claude\.ai$/, "claude"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)gemini\.google\.com$/, "gemini"],
  [/(^|\.)copilot\.microsoft\.com$/, "copilot"],
  [/(^|\.)deepseek\.com$/, "deepseek"],
  [/(^|\.)you\.com$/, "you"],
  [/(^|\.)phind\.com$/, "phind"],
];

export function Analytics() {
  useReportWebVitals((m) => {
    track("web_vital", { metric: m.name, value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value), rating: m.rating ?? "unknown" });
  });

  useEffect(() => {
    if (!document.referrer || sessionStorage.getItem("pae-ai-ref")) return;
    let host = "";
    try {
      host = new URL(document.referrer).hostname;
    } catch {
      return;
    }
    const hit = AI_REFERRERS.find(([re]) => re.test(host));
    if (!hit) return;
    sessionStorage.setItem("pae-ai-ref", hit[1]);
    // Scripts load after the page, so give them a moment before sending.
    const t = setTimeout(() => track("ai_referral", { source: hit[1], page: location.pathname }), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});`}
          </Script>
        </>
      )}
      {PLAUSIBLE && <Script src="https://plausible.io/js/script.tagged-events.js" data-domain={PLAUSIBLE} strategy="afterInteractive" />}
    </>
  );
}
