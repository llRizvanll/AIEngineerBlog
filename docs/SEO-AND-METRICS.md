# SEO, LLM crawling and metrics

## What the site now does by itself

- `/sitemap.xml` lists every page, and `/robots.txt` points to it.
- `/robots.txt` allows all crawlers, and names the main AI crawlers.
- `/llms.txt` is a short index for LLM tools. `/llms-full.txt` holds the full text of the AI interview paths.
- Every page has a title, a description, one canonical URL, Open Graph and Twitter tags, and a share image.
- Detail pages have JSON-LD: `TechArticle`, `Course`, `FAQPage` and `BreadcrumbList`.
- All content is in the static HTML, so crawlers that don't run JavaScript can read it.

Run `npm run build:static && npm run check:seo` to check all of this.

## Settings you need to add in Render

All are optional, and all are read during the build, so redeploy after changing one.

| Variable | Why | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The public address, only if you use a custom domain. Without it, the build uses Render's `RENDER_EXTERNAL_URL`. | Your domain, such as `https://example.com` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Proves to Google that you own the site. | Google Search Console, HTML tag method: the `content` value |
| `NEXT_PUBLIC_GA_ID` | Turns on Google Analytics 4. | GA4 property, Measurement ID (`G-...`) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Turns on Plausible instead, which is cookie-free and paid. | Your site's domain in Plausible |

With no analytics variable set, no tracking script loads. Google Analytics uses cookies, so if you have readers in the EU or UK you may need a consent banner. Plausible avoids cookies.

## After deploying

1. Add the site to Google Search Console and verify it.
2. Submit `sitemap.xml` in Search Console, and in Bing Webmaster Tools. Bing's index also feeds some AI search tools.
3. Use URL Inspection to request indexing for `/`, `/paths/ai-interviews/` and a few lessons.
4. Consider a custom domain. A `.onrender.com` address works, but moving later means redirects.
5. Share the best lessons where developers read, with links. New sites rank slowly without links from elsewhere.

## Metrics to watch

| Question | Metric | Where |
| --- | --- | --- |
| Are we indexed? | Indexed pages against sitemap pages | Search Console, Pages |
| Do we appear in search? | Impressions and average position by query | Search Console, Performance |
| Do people click? | Click-through rate by page | Search Console, Performance |
| Do LLMs send readers? | `ai_referral` event, by `source` and `page` | Analytics |
| Do readers learn? | `lesson_complete`, by `lesson` | Analytics |
| Is the practice used? | `card_rated`, `drill_done`, `prompt_copied` | Analytics |
| Is the site fast? | `web_vital` event: LCP, INP, CLS | Analytics, plus Search Console's Core Web Vitals |

Keywords to track in Search Console: AI interview preparation, AI engineer interview questions, AI-enabled coding interview, Meta AI coding interview, RAG interview questions, agent design interview, LLM evals interview, AI engineering blog.

## What this can't tell you

- A static site has no server logs here, so AI crawler visits can't be counted. The Node service option on Render would show them in its logs.
- An LLM may use the site without sending a click, and some send no referrer, so `ai_referral` undercounts.
- `llms.txt` is a proposed convention, and not every tool reads it. It's cheap to provide, but don't rely on it.
- `Allow` in `robots.txt` also lets AI companies use the content for training. To opt out of training only, set `Disallow: /` for `GPTBot`, `CCBot` and `Google-Extended` in `src/app/robots.ts`, and leave the search crawlers allowed.
- Nothing here guarantees a ranking. Expect weeks before a new site shows steady search traffic.
