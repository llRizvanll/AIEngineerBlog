"use client";

import { SESSION } from "@/config/storage";
import Script from "next/script";
import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/track";
import { ANALYTICS_GA_ID, ANALYTICS_PLAUSIBLE_DOMAIN, AI_REFERRERS } from "@/config/constants";

export function Analytics() {
  useReportWebVitals((m) => {
    track("web_vital", { metric: m.name, value: Math.round(m.name === "CLS" ? m.value * 1000 : m.value), rating: m.rating ?? "unknown" });
  });

  useEffect(() => {
    if (!document.referrer || sessionStorage.getItem(SESSION.aiReferrer)) return;
    let host = "";
    try {
      host = new URL(document.referrer).hostname;
    } catch {
      return;
    }
    const hit = AI_REFERRERS.find(([re]) => re.test(host));
    if (!hit) return;
    sessionStorage.setItem(SESSION.aiReferrer, hit[1]);
    // Scripts load after the page, so give them a moment before sending.
    const t = setTimeout(() => track("ai_referral", { source: hit[1], page: location.pathname }), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {ANALYTICS_GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(ANALYTICS_GA_ID)});`}
          </Script>
        </>
      )}
      {ANALYTICS_PLAUSIBLE_DOMAIN && <Script src="https://plausible.io/js/script.tagged-events.js" data-domain={ANALYTICS_PLAUSIBLE_DOMAIN} strategy="afterInteractive" />}
    </>
  );
}
