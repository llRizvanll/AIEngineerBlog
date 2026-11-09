# Architecture

Dependencies point one way, enforced by `npm run check:arch` (layering, cycles, dead files, size limits):

`types` < `config` < `content` < `lib` < `hooks` < `components` < `app`

A layer may import only from layers to its left.

| Layer | Holds |
|---|---|
| `src/types` | Shared type definitions |
| `src/config` | Every fixed value: `constants.ts` (limits, orders, option lists, colours, hosts, patterns), plus navigation, storage keys, code languages and card tones |
| `src/content` | All words and data: lessons, landing, `page-copy.ts` (page titles and lists), `ui-copy.ts` (component labels and prompts), `site.ts`, `sync-demo.ts`, `catalog-meta.ts`. No markup |
| `src/lib` | Pure logic: store, search, highlighting, browser events (`ui-events.ts`) |
| `src/components` | UI; `landing/`, `reels/`, `practice/` etc. group a feature |
| `src/app` | Routes only: compose content and components |
| `src/styles` | `index.css` imports `legacy/*` then `01`–`10` in cascade order. Do not reorder. |

## How to add

- **Rail or landing link**: edit `config/navigation.ts`.
- **Local-storage key**: add to `STORAGE` in `config/storage.ts`; never write a literal key.
- **Code language**: add to `LANGUAGES` in `config/languages.ts`, then supply `variants` to `Code`.
- **Card colour**: `--tone-N` in `styles/01-tokens.css` and `TONE_COUNT` in `config/tones.ts`.
- **Landing section copy**: `content/landing.ts`.
- **New hub or lesson**: add content in `content/`, a route in `app/`, then a rail `match` prefix.

## Checks

`npm run check:arch`, `check:seo`, `check:reach`, `test:modules`. To prove a refactor leaves pages unchanged: `npm run snapshot -- save f.json`, change, rebuild, `npm run snapshot -- compare f.json`.

**Rule of thumb:** a number, key, colour, URL or pattern goes in `config/constants.ts`; a sentence or a list a reader sees goes in `content/`.

**Page copy:** each page's headings, intros, button labels, footers and metadata live in `src/content/pages/<route>.ts` (for example `explore.ts` exports `EXPLORE_COPY` and `EXPLORE_META`). Change the wording there; the page file only lays it out. Component labels are in `content/ui-copy.ts`.
