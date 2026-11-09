
import { SITE_URL } from "@/config/constants";
import { SITE } from "@/content/site";

const trailing = process.env.STATIC_EXPORT === "1";

/** An absolute URL in the same form the host serves, so crawlers see one address per page. */
export function absoluteUrl(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  const [p, rest] = path.split(/(?=[?#])/);
  return `${SITE_URL}${trailing && !p.endsWith("/") ? `${p}/` : p}${rest ?? ""}`;
}

const author = () => ({ "@type": "Person", name: SITE.author });

export function articleLd(input: { title: string; description: string; path: string; section?: string; keywords?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    author: author(),
    publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
    isAccessibleForFree: true,
    inLanguage: "en",
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
  };
}

export function courseLd(input: { title: string; description: string; path: string; parts: { title: string; path: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
    isAccessibleForFree: true,
    inLanguage: "en",
    hasPart: input.parts.map((p, i) => ({ "@type": "LearningResource", position: i + 1, name: p.title, url: absoluteUrl(p.path) })),
  };
}

export function faqLd(items: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}

export function breadcrumbLd(trail: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: absoluteUrl(path) })),
  };
}
