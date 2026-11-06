# AI Engineer — blogging portal

A Next.js 16 + TypeScript portal: a 7-part long-read series, 11 system design rounds, 15 coding patterns with 45 worked TypeScript problems, 9 mobile machine-coding problems in tested Kotlin, 33 behavioral problem-solving answers, 12 deep dives, 14 protocol lessons, 154 revision cards and 22 reel collections.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # every page is statically generated
npm run preview # production build + server (fast clicks)
npm run test:mobile # compile the Kotlin mobile solutions (warnings as errors) and run their 68 tests
```

## Where things live

- `src/content/*.json` — all content, typed by `src/content/types.ts`
- `src/content/coding.ts` — coding patterns, method, cheat sheets and hacks (TypeScript, strict mode, all snippets type-checked and tested)
- `src/content/behavioral.ts` — problem-solving questions (list from Clevry) with original STAR answers
- `src/content/coding-more.ts` — two extra worked problems per pattern (all tested)
- `src/content/mobile/*.kt` + `src/content/mobile-coding.ts` — mobile machine-coding solutions (Kotlin, coroutines) and their walkthroughs; tests in `tests/mobile/MobileTests.kt`
- `src/lib/prep-reels.ts` — reel collections generated from those two files
- `src/content/background-sync.html` — the hand-written Part 1 (its widgets live in `src/lib/bgsync.ts`)
- `src/lib/` — content access, curriculum, search index, localStorage store
- `src/components/` — reading layout, diagrams (SVG drawn from data), search palette, reels player, interview round, protocol explorer
- `src/app/theme.css` — the "Aurora" design system (tokens, components, home). `globals.css` is the base layer it overrides.

Reader progress, notes, saves and whiteboards are stored in the browser's localStorage.

## Deploy

Every page is prerendered at build time, so the site runs on any Node host or as plain static files.
Node 20.9+ is required (`.nvmrc` pins 22).

| Host | Build command | Start / publish |
| --- | --- | --- |
| Render web service, Railway, Heroku, Fly (Node) | `npm ci && npm run build` | `npm start` (reads `$PORT`) |
| Render static site, Cloudflare Pages, Netlify static, GitHub Pages, S3 | `npm ci && npm run build:static` | publish the `out/` folder |
| Vercel / Netlify (Next.js runtime) | auto-detected | auto-detected |
| Docker (any container host) | `docker build -t ai-engineer .` | `docker run -p 3000:3000 ai-engineer` |

`render.yaml` is a ready Render Blueprint with both a Node service and a static site; keep the one you want.
The build downloads Google Fonts through `next/font`, so the build machine needs internet access.

Code samples use TypeScript or Kotlin throughout. `test:mobile` uses `kotlinc` if it is on your PATH, otherwise the Kotlin compiler that Gradle caches under `~/.gradle`.

## Catalog and content checks

- `src/lib/catalog.ts` builds every asset in the format of `src/content/portal-asset-schema.json`, and an invalid asset fails the build. `/explore` filters it.
- `src/content/modules/` holds the AI systems modules, flashcards and reels. Their code samples live in `modules/code/`.
- `npm run test:modules` runs the TypeScript samples' tests. Python samples are syntax-checked only, because they need PyTorch, Triton or Ray and a GPU.
- `npm run lint:copy` reports "to be" verbs, wind-up phrases and sentence length per content file.

## SEO and metrics

See [docs/SEO-AND-METRICS.md](docs/SEO-AND-METRICS.md) for the settings to add, the steps after deploying, and what to measure.
