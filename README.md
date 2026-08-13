# Portfolio

React/Vite portfolio with prerendered fallback content and dynamically refreshed GitHub data.

## GitHub data

The browser requests `/api/github`, which fetches profile, repository, language, pinned repository, and contribution data server-side. Vercel caches the response for 15 minutes and serves stale data during temporary GitHub outages. `/api/systems` checks trusted deployed-project URLs on a separate five-minute cache.

The build still generates `src/data/github-static.json` for prerendering and offline fallback. A Vercel cron warms the GitHub endpoint daily while normal traffic refreshes the shared cache every 15 minutes.

Required server environment variables:

```text
GITHUB_TOKEN=github_token_with_public_repository_read_access
GITHUB_USERNAME=Sami001-OG
```

Do not create `VITE_GITHUB_TOKEN`; `VITE_` variables are browser-visible.

## Commands

```text
npm run dev
npm run build:ssr
npm run fetch-github
```
