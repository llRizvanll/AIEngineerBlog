import { JsonLd } from "@/components/JsonLd";
import { KeepReading } from "@/components/KeepReading";
import { FaqSection } from "@/components/landing/FaqSection";
import { FeatureSection, StartSection } from "@/components/landing/CardSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHero } from "@/components/landing/LandingHero";
import { LessonPreview } from "@/components/landing/LessonPreview";
import { FAQ, FEATURES, START } from "@/content/landing";

import { siteMap } from "@/lib/sections";
import { absoluteUrl } from "@/lib/site";
import { SITE } from "@/content/site";

/* The landing page only arranges sections. Their words and cards live in content/landing.ts,
   their markup in components/landing, so each can change without touching the others. */

const siteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: absoluteUrl("/"),
  description: SITE.description,
  inLanguage: "en",
  publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function Home() {
  return (
    <main className="landing io">
      <JsonLd data={siteSchema} />
      <JsonLd data={faqSchema} />
      <LandingHero />
      <KeepReading />
      <StartSection {...START} />
      <LessonPreview />
      <FeatureSection {...FEATURES} />
      <FaqSection />
      <LandingFooter groups={siteMap()} />
    </main>
  );
}
