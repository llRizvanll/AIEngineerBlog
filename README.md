# AI Engineer — blogging portal

A Next.js 16 + TypeScript portal: a 7-part long-read series, 11 system design rounds, 15 coding patterns with 45 worked Python problems, 9 mobile machine-coding problems in tested Swift, 33 behavioral problem-solving answers, 12 deep dives, 14 protocol lessons, 154 revision cards and 22 reel collections.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # every page is statically generated
npm run preview # production build + server (fast clicks)
npm run test:swift  # compile the Swift solutions under Swift 6 and run their tests
```

## Where things live

- `src/content/*.json` — all content, typed by `src/content/types.ts`
- `src/content/coding.ts` — coding patterns, method, cheat sheets and hacks (Python, all snippets tested)
- `src/content/behavioral.ts` — problem-solving questions (list from Clevry) with original STAR answers
- `src/content/coding-more.ts` — two extra worked problems per pattern (all tested)
- `src/content/mobile/*.swift` + `src/content/mobile-coding.ts` — mobile machine-coding solutions and their walkthroughs; tests in `tests/mobile/main.swift`
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
