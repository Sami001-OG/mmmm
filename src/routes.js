// Single source of truth for route paths. Imported by App.jsx (client + SSR)
// and re-exported through the server bundle for scripts/prerender.mjs, so the
// prerendered route list can never drift from the router.
export const ROUTES = {
  home: '/',
  cv: '/cv',
  admin: '/admin',
  adminPanel: '/admin/panel',
}

// Paths baked into static HTML at build time. Admin is intentionally excluded:
// it renders as a client-only, noindexed shell (see scripts/prerender.mjs).
export const PRERENDER_ROUTES = [ROUTES.home, ROUTES.cv]

// Client-only routes that still need a navigable HTML shell on the host.
export const SHELL_ROUTES = [ROUTES.admin, ROUTES.adminPanel]

// Canonical origin for absolute URLs (canonical tags, OG, sitemap). Override at
// build time with SITE_URL; falls back to the production domain. No trailing slash.
export const SITE_URL = (
  (typeof process !== 'undefined' && process.env && process.env.SITE_URL) ||
  'https://sami.dev'
).replace(/\/$/, '')

// Per-route <head> content baked into prerendered HTML. Keeps titles,
// descriptions, and canonicals from drifting across the SSR pipeline.
export const ROUTE_META = {
  [ROUTES.home]: {
    title: 'Sami — Developer',
    description: 'Developer from Dhaka. A Bauhaus-grammar portfolio pulling live GitHub data — projects, languages, and contribution activity.',
  },
  [ROUTES.cv]: {
    title: 'CV — Sami',
    description: 'Print-ready curriculum vitae: experience, education, skills, and selected projects.',
  },
}
