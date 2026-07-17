// Static prerender of all known routes using the SSR render() function.
//
// Emits into dist/:
//   - index.html            (route "/", full SSR HTML — SEO + LCP content)
//   - <route>/index.html    for each additional PRERENDER_ROUTE
//   - <route>/index.html    client-only noindex shell for each SHELL_ROUTE (admin)
//   - 404.html              real 404 (unknown URLs no longer soft-200)
//
// Route lists come from src/routes.js via the server bundle, so this script
// can never drift from App.jsx's router.
//
// Dist hygiene: after rendering, the SSR bundle (dist/server) and the
// intermediate client dir (dist/client) are removed so nothing ships twice
// and the server bundle isn't publicly downloadable.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.resolve(ROOT, 'dist')
const DIST_CLIENT = path.resolve(DIST, 'client')
const DIST_SERVER = path.resolve(DIST, 'server')

const NOINDEX = '<meta name="robots" content="noindex, nofollow" />'

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Rewrites the shared template's <head> for a specific route: swaps <title>,
// description, OG/Twitter title+description+url, adds a canonical link, and
// injects an optional JSON-LD block. Keeps every prerendered page's metadata
// honest instead of shipping the homepage's tags on every route.
function applyMeta(template, { title, description, canonical, jsonLd }) {
  let html = template
  if (title) {
    const t = escapeHtml(title)
    html = html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`)
  }
  if (description) {
    const d = escapeHtml(description)
    html = html
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${d}$2`)
  }
  const inject = []
  if (canonical) {
    inject.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    inject.push(`<meta property="og:url" content="${escapeHtml(canonical)}" />`)
  }
  if (jsonLd) {
    inject.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`)
  }
  if (inject.length) {
    html = html.replace('</head>', `    ${inject.join('\n    ')}\n  </head>`)
  }
  return html
}

function writeSitemap(routes, siteUrl) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = routes
    .map((r) => {
      const loc = r === '/' ? `${siteUrl}/` : `${siteUrl}${r}`
      const priority = r === '/' ? '1.0' : '0.7'
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

// robots.txt with an absolute Sitemap URL (the spec requires absolute; the
// static public/robots.txt is a fallback for non-prerender builds).
function writeRobots(siteUrl) {
  return `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`
}

// The machine-readable "you": `curl <site>/sami.json`. Structured profile,
// stack, and projects assembled from the same sources the site renders —
// GitHub sync + committed content.json (manual projects are first-class).
function buildProfileJson(siteUrl) {
  let gh = {}
  let content = {}
  try { gh = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'src/data/github-static.json'), 'utf-8')) } catch { /* empty */ }
  try { content = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'src/data/content.json'), 'utf-8')) } catch { /* none */ }
  if (gh._empty) gh = {}

  const ghProjects = [...(gh.pinnedRepos || []), ...(gh.repos || [])].map((r) => ({
    name: r.title,
    description: r.description || '',
    tags: r.tags || [],
    repo: r.href || '',
    live: r.homepage || '',
    stars: r.stars || 0,
    source: 'github',
  }))
  const manualProjects = (content.projects || [])
    .filter((p) => p && p.title)
    .map((p) => ({
      name: p.title,
      description: p.description || '',
      tags: typeof p.tags === 'string' ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : (p.tags || []),
      repo: p.repo || '',
      live: p.href && p.href !== '#' ? p.href : '',
      source: 'manual',
    }))

  const profile = content.profile || {}
  return {
    $schema: 'https://sami.dev/sami.schema.json',
    generatedAt: new Date().toISOString(),
    name: profile.name || 'Sami',
    title: profile.title || 'Student & Developer',
    location: profile.location || 'Dhaka, Bangladesh',
    bio: profile.bio || '',
    url: `${siteUrl}/`,
    availability: profile.status || '',
    links: {
      github: 'https://github.com/Sami001-OG',
      twitter: 'https://twitter.com/Sami38174202',
      ...(profile.email ? { email: profile.email } : {}),
    },
    stack: (gh.languages || []).map((l) => ({ name: l.name, share: l.percentage })),
    skills: content.skills || [],
    stats: {
      repositories: (gh.repos?.length || 0) + (gh.pinnedRepos?.length || 0),
      stars: gh.totalStars || 0,
      contributionsLastYear: gh.contributions?.total || 0,
    },
    projects: [...manualProjects, ...ghProjects],
  }
}

function copyDir(src, dest, skipTopLevelIndexHtml = false) {
  if (!fs.existsSync(src)) return
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
      copyDir(s, d, false)
    } else {
      if (skipTopLevelIndexHtml && entry.name === 'index.html') continue
      fs.copyFileSync(s, d)
    }
  }
}

function writeRoute(route, html) {
  let file
  if (route === '/') {
    file = path.join(DIST, 'index.html')
  } else {
    const dir = path.join(DIST, route)
    fs.mkdirSync(dir, { recursive: true })
    file = path.join(dir, 'index.html')
  }
  fs.writeFileSync(file, html)
  return path.relative(ROOT, file)
}

async function main() {
  // 1. Build SSR server bundle → dist/server/entry-server.js
  await build({
    logLevel: 'warn',
    build: {
      ssr: path.resolve(ROOT, 'src/entry-server.jsx'),
      outDir: DIST_SERVER,
      emptyOutDir: true,
      rollupOptions: { output: { format: 'es' } },
    },
    ssr: { noExternal: true },
  })

  // 2. Build client bundle → dist/client/
  await build({
    root: ROOT,
    logLevel: 'warn',
    build: { outDir: DIST_CLIENT, emptyOutDir: true },
  })

  // 3. Load render() + route lists from the server bundle.
  const { render, PRERENDER_ROUTES, SHELL_ROUTES, ROUTE_META, SITE_URL } = await import(
    pathToFileURL(path.resolve(DIST_SERVER, 'entry-server.js')).href
  )

  // JSON-LD Person graph — homepage only. Links the identity to GitHub so
  // search engines connect the portfolio to the profile it mirrors.
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sami',
    url: `${SITE_URL}/`,
    jobTitle: 'Student & Developer',
    address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' },
    sameAs: ['https://github.com/Sami001-OG', 'https://twitter.com/Sami38174202'],
  }

  // 4. Client index.html is the template for every emitted page. OG images
  //    must be absolute URLs for social crawlers — resolve against SITE_URL.
  const template = fs
    .readFileSync(path.join(DIST_CLIENT, 'index.html'), 'utf-8')
    .replaceAll('content="/og.png"', `content="${SITE_URL}/og.png"`)

  // 5. Mirror client assets (JS, CSS, fonts, favicon) into dist/ root.
  fs.mkdirSync(DIST, { recursive: true })
  copyDir(DIST_CLIENT, DIST, true)

  const written = []

  // 6a. Prerendered content routes — full SSR HTML + per-route <head>.
  for (const route of PRERENDER_ROUTES) {
    const meta = ROUTE_META[route] || {}
    const canonical = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`
    let withMeta = applyMeta(template, {
      ...meta,
      canonical,
      jsonLd: route === '/' ? personLd : null,
    })
    // Advertise the machine-readable profile from the homepage head.
    if (route === '/') {
      withMeta = withMeta.replace(
        '</head>',
        `    <link rel="alternate" type="application/json" href="${SITE_URL}/sami.json" title="sami.json — machine-readable profile" />\n  </head>`
      )
    }
    const html = withMeta.replace('<!--app-html-->', render(route))
    written.push(writeRoute(route, html))
  }

  // 6b. Admin shells — client-only, noindexed. Ship the empty root div; the
  //     router mounts the admin UI after hydration. Never prerender content.
  for (const route of SHELL_ROUTES) {
    const html = template
      .replace('<!--app-html-->', '')
      .replace('</head>', `    ${NOINDEX}\n  </head>`)
    written.push(writeRoute(route, html))
  }

  // 6c. Real 404 — render the catch-all route, drop the soft-404 rewrite.
  const notFound = applyMeta(template, {
    title: 'Not found — Sami',
    description: 'The page you requested does not exist.',
  }).replace('<!--app-html-->', render('/__404__'))
  fs.writeFileSync(path.join(DIST, '404.html'), notFound)
  written.push('dist/404.html')

  // 6d. sitemap.xml — indexable routes only (admin/404 excluded). robots.txt
  //     is rewritten with an absolute Sitemap URL (overwrites the static copy
  //     brought in by copyDir in step 5).
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), writeSitemap(PRERENDER_ROUTES, SITE_URL))
  written.push('dist/sitemap.xml')
  fs.writeFileSync(path.join(DIST, 'robots.txt'), writeRobots(SITE_URL))
  written.push('dist/robots.txt')

  // 6e. sami.json — the machine-readable profile. `curl <site>/sami.json`.
  fs.writeFileSync(path.join(DIST, 'sami.json'), JSON.stringify(buildProfileJson(SITE_URL), null, 2))
  written.push('dist/sami.json')

  // 7. Dist hygiene: drop the SSR bundle and the intermediate client dir so
  //    nothing ships twice and the server bundle isn't publicly downloadable.
  fs.rmSync(DIST_SERVER, { recursive: true, force: true })
  fs.rmSync(DIST_CLIENT, { recursive: true, force: true })

  for (const rel of written) console.log(`  prerendered ${rel}`)
  console.log(`\n✓ Prerendered ${written.length} file(s) into dist/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
