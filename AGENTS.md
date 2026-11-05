# AGENTS.md

React portfolio (Vite + SSR/prerender), deployed to Vercel (`buildCommand: npm run build:ssr`, output `dist/`). Node ≥20. No tests/lint/typecheck.

## Commands

- `npm run dev` — fetches GitHub snapshot (`scripts/fetch-github.mjs`), then `vite` on :5173. Local `/api/*` served via `vite.config.js` `localApi()` plugin.
- `npm run dev:ssr` — dev SSR (`server.js` in Vite middleware mode).
- `npm run build:ssr` — production Vercel path: `fetch-github` → `generate-og/poster/icons` → `prerender.mjs` (SSR to `dist/server` + client to `dist/client`, then flattened into `dist/`, server bundle deleted). This is what ships.
- `npm run build` — client-only build (no prerender). `npm start` — prod SSR from `dist/server` (unused on Vercel).
- `npm run fetch-github` — standalone GitHub snapshot refresh; safe to run, no-op-warns without `GITHUB_TOKEN`, keeps previous snapshot on failure.

All `dev`/`build*` scripts run `fetch-github` first — builds without network/token silently reuse `src/data/github-static.json` (gitignored, never edit by hand).

## Data flow

- Browser → `/api/github` (`api/github.js`, Vercel fn, 15-min cache + stale-serve) → live data; fallback is build-time `src/data/github-static.json`.
- `/api/systems` (`api/systems.js`) separate 5-min cache. Shared fetch logic: `lib/github-data.js`.
- Manual content (profile, projects, skills — edited via `/admin` panel → `/api/publish` → commit to `src/data/content.json`): see `src/data/content.json`, `src/data/portfolio.js`.
- App-level secrets must never be `VITE_`-prefixed (browser-visible). `.env.example` documents all: `GITHUB_TOKEN`, `GITHUB_USERNAME` (default `Sami001-OG`), `VITE_ADMIN_PASSWORD`/`ADMIN_PASSWORD` (publish API), `CONTENT_REPO`, `SITE_URL` (default `https://samish.me`).

## Routes & SSR (do not duplicate)

- **Single source of truth: `src/routes.js`.** `ROUTES`, `PRERENDER_ROUTES` (`/`, `/cv`), `SHELL_ROUTES` (admin — noindex client-only shell), `ROUTE_META` (per-route head baked at build), `SITE_URL`. `entry-server.jsx` re-exports route lists so `prerender.mjs` can't drift from `App.jsx`. Add a route by editing `routes.js` + `App.jsx` only.
- Prerender/SSR output: full SSR HTML for `PRERENDER_ROUTES`, empty noindexed shells for `SHELL_ROUTES`, real `404.html`, `sitemap.xml`, `robots.txt`, `sami.json` — all generated in `scripts/prerender.mjs`. Don't add routes there. `index.html` has `<!--app-html-->` placeholder and OG tags templated at build (with `/og.png` rewritten to absolute `$SITE_URL/og.png`).
- Entrypoints: `src/entry-client.jsx` (hydration + lazy Vercel Analytics), `src/entry-server.jsx` (`render(url)` via `StaticRouter`). `src/main.jsx` is only the plain client mount for non-SSR builds.

## Design tokens

Bauhaus "Dessau Dark" system in `tailwind.config.js` — read the header there before styling. Radius is 0 or 9999 only, no shadows. Colors are CSS-channel triplets in `src/index.css` (`rgb(var(--c-*) / <alpha-value>)`); `data-theme="paper"` swaps values. Never hardcode hex in components. Fonts are `@fontsource-variable/*` (Archivo/DM Sans/Chivo Mono), mapped in Tailwind config (`font-display`, `font-sans`, `font-mono`).

## API routes

`api/` holds Vercel serverless fns: `github.js`, `systems.js`, `og.js`, `publish.js`. In dev they run in-process via the `localApi` plugin in `vite.config.js` (manual `req/res` shim: `res.status()`, `res.json()`) — don't assume Vercel req/res API in dev.

## Release / refresh

Daily GitHub Actions (`.github/workflows/refresh-github.yml`) runs `fetch-github` and commits `src/data/github-static.json`. The file is gitignored locally but force-added by CI (`git add -f`). Vercel cron (`vercel.json`) warms `/api/github` daily.
