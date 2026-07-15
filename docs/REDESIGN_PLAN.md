# DESSAU DARK — Portfolio Redesign Master Plan

> Status: **PLAN ONLY — no code changed yet.** Produced 2026-07-15 from a 10-agent
> audit/research/design/critique workflow over this repo.

---

## 0. Direction statement

**Dessau Dark.** Bauhaus grammar — three shapes (● ■ ▲), three primaries, asymmetric
grid, type-as-architecture — printed on warm off-black paper instead of white.

The current cyber/holo layer is **deleted wholesale**: scanlines, radar sweeps, aurora
blobs, CursorGlow, Constellation, glass blur, glow rings, card glare, Scramble/TypeWriter,
the oscilloscope, StatCard's fake live-jitter. What survives is the *structure* underneath
(sidebar + topbar chassis, section rhythm, data density, mono metadata) re-clothed in flat
geometry: elevation by outline and rule weight, motion by mechanical slide/rotate/snap,
ornament by circle–square–triangle only.

**One-line thesis:** the site stops *simulating* a machine (CRT glow, holograms) and
starts being *built like one* — visible grid, decisive motion, three shapes, three colors,
warm black paper.

---

## 1. What we found (audit summary)

### Architecture (current)
- Vercel serves **pure static** output: `build:ssr` → `scripts/prerender.mjs` renders
  `/`, `/cv`, `/admin`, `/admin/panel` to static HTML; `server.js`/sirv never run in prod.
- GitHub data is fetched **at build time only** (`scripts/fetch-github.mjs` → REST +
  GraphQL → `src/data/github-static.json`, statically imported into the bundle).
- **Bugs/debt to fix regardless of redesign:**
  - `sort=stars` is not a valid GitHub REST param (fetch-github.mjs:97) — "top repos" are
    actually alphabetical.
  - Any fetch failure silently overwrites the JSON with `{_empty:true}` and deploys mock data.
  - `dist/server/` (the SSR bundle) is publicly downloadable; client assets ship twice.
  - Soft-404s: unknown URLs return HTTP 200 with the Dashboard snapshot; no 404 route.
  - `/admin` + `/admin/panel` are prerendered public HTML.
  - `og:image` points to an SVG favicon (crawlers can't use it); Google Fonts CSS is
    render-blocking.
  - Single JS chunk: admin panel + react-markdown + GitHub JSON ship to every visitor.

### Data & admin (current)
- Admin persistence is **localStorage only** — edits are invisible to visitors and to
  prerender. Export button reads a key (`portfolio_draft`) that nothing writes → always
  "No changes to export."
- Auth is cosmetic: `VITE_ADMIN_PASSWORD` ships in plaintext in the bundle;
  `sessionStorage.admin_auth='1'` bypasses it.
- **There is NO projects editor, no projects entity, and no image field anywhere.**
  The Projects section renders only GitHub pinned repos + repo list.

### SSR constraints any redesign must respect
1. `renderToString` runs in Node — no window/document/canvas/WebGL in the SSR path.
2. `ssr.noExternal: true` bundles every SSR-reachable import — three.js/GSAP must never
   be statically imported by routed components; use dynamic import in `useEffect`.
3. Hydration parity: no `Math.random`/`Date.now`/viewport-dependent markup on first render.
4. No `React.lazy`/Suspense in the SSR path — use mounted-gate (`useEffect → setMounted`).
5. New routes must be added to both `App.jsx` and `ROUTES` in prerender.mjs.
6. The prerendered HTML **is** the SEO + LCP content — real content must never hide
   behind loaders or client-only effects.

---

## 2. Design system

### 2.1 Color tokens

Surfaces (warm-neutral, never pure black):

| Token | Hex | Role |
|---|---|---|
| `bg-sunken` | `#0E0D10` | hero band, footer |
| `bg` | `#111014` | page ground |
| `surface` | `#1A191E` | cards (flat, no shadow) |
| `surface-2` | `#232228` | hover, inset wells, kbd chips |
| `line` | `#2A2930` | 1px hairlines, exposed grid lines |
| `line-strong` | `#3B3A41` | 2px structural outlines |
| `text-dim` | `#A5A2A9` | secondary text — 7.5:1 vs bg (AAA) |
| `text` | `#F2F0EB` | primary "ink" — 16.6:1 (AAA) |

Accents (Bauhaus primaries lifted for dark; ratios vs `#111014`):

| Token | Fill | Ratio | Text-safe variant | Ratio |
|---|---|---|---|---|
| `red` | `#E5484D` | 4.84:1 (AA large/UI) | `#FF6B5B` | 6.77:1 |
| `yellow` | `#F5C518` | 11.63:1 (AAA) | same | — |
| `blue` | `#4C8DFF` | 5.92:1 (AA) | `#7AA7FF` (links) | 7.94:1 |

Semantics: no decorative green — `status-live` `#46A758` **only** for the hero's real
availability dot. Error = red, warning = yellow, info/link = blue. Focus ring = 2px solid
yellow, 2px offset. **No gradients anywhere.**

**Accent assignment — Kandinsky mapping, one accent per section:**
- **Blue ● circle = data.** Stats, contribution graph, language chart, links.
- **Red ■ square = work.** Projects, experience, education.
- **Yellow ▲ triangle = action.** Hero identity, CTAs, active nav, focus, hover punctuation.

A component uses its section's accent + neutrals, never a second accent.
**Declared exemption (write into token doc): charts.** Ordinal data ramps may use
blue → yellow → red → off-white-at-opacity, because ordinal encoding needs >1 hue.
Featured-project yellow band is the one other cross-accent (it's an "action" flag).

### 2.2 Typography

**Archivo** (display) + **DM Sans** (body) + **Chivo Mono** (labels/data) — all variable,
**self-hosted via Fontsource** (kills render-blocking Google CSS).

| Token | Size / line | Face & weight | Case & tracking |
|---|---|---|---|
| `display-xl` | clamp(72px,10vw,144px) / 0.95 | Archivo 900 | **lowercase** (Bayer ref), −2% |
| `display` | 48px / 1.05 | Archivo 800 | lowercase, −1.5% |
| `h2` | 32px / 1.15 | Archivo 800 | lowercase, −1% |
| `h3` | 21px / 1.3 | Archivo 700 | sentence, −0.5% |
| `body` | 15px / 1.6 | DM Sans 400/500 | sentence |
| `small` | 13px / 1.5 | DM Sans 400 | sentence |
| `mono-data` | 13px / 1.4 | Chivo Mono 500 | tabular-nums |
| `mono-label` | 11px / 1.2 | Chivo Mono 600 | UPPERCASE, +8% |

Rules: lowercase reserved for Archivo display (the one deliberate Bauhaus tell); uppercase
reserved for 11px mono eyebrows (`01 — WORK`, dates, coordinates). Oversize type appears
exactly twice: hero name and section index numerals.

### 2.3 Geometry & layout grammar

- **Grid:** 12 cols, 24px gutters, 8px base, main column max 1200px beside the sidebar.
  **Exposed grid:** 1px `line` verticals rendered on hero and section boundaries only
  (static `aria-hidden` divs — SSR-safe).
- **Corner radius policy: 0px or 50%, nothing between.** Sharp cards/buttons/inputs/chips;
  perfect circles for avatars/dots/charts. Delete `rounded-2xl` globally.
- **Rules replace all shadows and dividers:** 1px hairlines; 2px structural outlines;
  4px accent rules as card/section headers; 6–8px accent bands on hero/footer edges.
  **Elevation: none.** Delete every box-shadow, backdrop-filter, glow token.
- **Shape system (functional, not decorative):**
  - ● circle: avatars (2px flat ring), status dots, timeline nodes, chart form, toggles.
  - ■ square: list bullets (6px filled), tag chips, checkboxes, heatmap cells, active-nav marker.
  - ▲ triangle: link arrows (replace chevrons), CTA suffix, sort indicators, scroll hint.
- **Section headers:** oversized mono index numeral (`01`) at 12% opacity behind an
  Archivo lowercase title, 4px section-accent rule beneath, optional 90°-rotated mono
  label in the outer gutter.
- **Diagonals:** one 45° device per page maximum (the hero's clipped yellow band).

### 2.4 Component restyling map

| Component | Becomes |
|---|---|
| Sidebar | Flat `bg-sunken` column, 1px right edge. Active indicator: 8×8 yellow square sliding on `steps(1)` + 2px yellow left rule. Flat avatar, no glow-ring. |
| TopBar | Solid band, 1px bottom hairline. Oscilloscope → mono UTC clock + blue dot. Search → cmdk trigger, sharp 2px outline, square kbd chip. |
| Hero | `display-xl` lowercase name via rectangle wipe; DM Sans bio with yellow triangle bullet; the Kinetic Composition (§3) right; one 45° yellow band clipping the bottom edge. |
| StatCard | Flat surface, 1px outline, 4px blue top rule. Kill jitter/tilt/glare/scanline. Count-up quantized (odometer feel). Hover: outline→2px, translate −2px. Sparkline → 12-bar quantized mini chart. |
| ProjectCard | **Gains image slot**: duotone cover (§2.5) in 2px frame, mono index `01` top-left, square red tag chips, triangle link arrow. Featured = 6px yellow top band. |
| Skills | **Kill proficiency bars/meters entirely** (reviewer red-flag). Grouped square-chip tags with years/context. Block-meter aesthetic reserved for objective data only (language share). |
| Timeline | 4px off-white vertical rule; filled red circle nodes (current role outlined + green dot); year as 32px Chivo Mono in gutter. Delete Dashboard's inline duplicate; one component. |
| ContributionGraph | Sharp square cells, 5-step blue ramp `#1A2540→#4C8DFF`, 1px gaps. "LIVE" chip → **"data as of {build date}"** mono stamp. Cells keyboard-focusable + visually-hidden text. |
| DonutChart | Keep the circle (it IS the motif): flat segments, 4px bg gaps, no glow/rotation. Ordinal ramp per exemption. Center: Archivo count-up. Visually-hidden data table. |
| CV page | Unify with tokens: Archivo/DM Sans/Chivo Mono, 4px rules, square bullets. Print stays black-on-white — Bauhaus inverts losslessly. |
| Loader | **Deleted.** The hero entrance is the boot sequence. |

### 2.5 Imagery & icons

- Icons: keep single-path SVG set; restyle to 2px stroke, square caps, miter joins.
  Triangles replace chevrons.
- **Project screenshots (dark-safe):** duotone by default — grayscale mapped
  `#1A191E → #F2F0EB`, tinted 15% toward section accent, 2px frame + 8px accent rule on
  one edge. Hover lifts to full color over 300ms (touch/reduced-motion: full color always).
- **Placeholder art:** projects without images get a deterministic Schmidt-style shape
  composition seeded from a project-name hash (pure function, SSR-safe).
- Avatar/OG: flat circle crop; real 1200×630 PNG OG images (fixes SVG crawler bug).

---

## 3. Motion & 3D

### 3.1 Stack (post-critique resolution)

- **3D: vanilla Three.js (~115KB gz chunk), dynamically imported. NO react-three-fiber/drei.**
  One scene of ~12 flat-shaded primitives doesn't justify a reconciler; vanilla gives us
  render-on-demand (idle scene = 0% CPU) and keeps the SSR bundle clean.
- **Animation: GSAP 3 + ScrollTrigger (~35KB gz).** Timeline choreography matches the
  mechanical idiom; framer-motion's spring physics is exactly the grammar we're banning.
- **Smooth scroll: Lenis (~3KB)**, GSAP-ticker-synced, `lerp: 0.12` (firm, machined —
  not floaty), `syncTouch: false` (native touch on mobile), disabled under reduced motion.
- **SSR safety:** mounted-gate pattern everywhere; GSAP/Lenis/three init only in
  `useEffect`; SSR HTML at final layout state (no `opacity:0` markup — GSAP hides then
  reveals post-hydration, so no-JS/crawlers see full content).
- Vite `manualChunks`: `vendor-react`, `motion` (gsap+lenis), `three` (idle-loaded),
  `admin` (lazy).

### 3.2 The signature piece — "The Kinetic Composition"

Joost Schmidt's 1923 Bauhaus exhibition poster, extruded. Right two-fifths of the hero.

- **Orthographic camera** at a fixed axonometric angle — reads as a constructivist print
  that happens to move, not a video game.
- Blue ring (torus, rectangular cross-section) + red square slab intersecting on a 45°
  diagonal + yellow triangular prism at the ring's tangent + three off-white rods on grid
  axes + a small gear-disc riding the ring.
- `MeshLambertMaterial`, one directional light + low ambient, `EdgesGeometry` off-white
  outlines — a technical drawing in motion. No shadows/bloom/fog/post. ~16 draw calls.
- **Motion = machinery:** ring rotates 1 rev/90s; every 6s a snap event — slab rotates
  exactly 90° (400ms, hard ease), gear counter-rotates 45°, a rod slides and brakes.
  Renderer draws only while a tween is live.
- **Cursor:** whole composition tilts ±5° with heavy damping — a nudged drafting table,
  not a hologram.
- **Scroll:** one ScrollTrigger scrubs an **exploded-axonometric disassembly** as you
  scroll into the work — the poster takes itself apart. This is the site's one
  unforgettable mechanic.
- **Fallback IS a complete design:** a hand-built inline SVG of the identical composition
  (~4KB) is the prerendered LCP content on all devices. Tier B gets SVG + one CSS
  step-rotation on the gear. The canvas only ever *upgrades* the SVG on capable desktops.

### 3.3 Motion grammar

- **Hero entrance (~1.1s, one timeline):** 6px rule draws → name lines wipe in via
  `clip-path` (70ms stagger) → mono metadata stamps in `steps(1)` (typesetting, not
  typing) → SVG shapes stamp + snap-rotate → yellow corner square locks at 45°.
- **Scroll reveals — nothing fades:** clip-path wipes from the nearest grid axis; every
  section opens with its rule drawing + index numeral stamping; cards slide 24px on one
  axis, 70ms stagger; one reveal per element, `once: true`.
- **Hover:** cards translate 4px + border 1px→2px + marker snap-rotates 45°; links get a
  drawing underline; buttons get an accent block wipe with text inverting to ink.
  Never glow, scale, tilt, or glare. A small registration-mark crosshair appears at card
  corners (pure CSS).
- **Page transitions:** View Transitions API where supported — full-viewport accent
  rectangle wipes up (280ms) / reveals down. Fallback: instant navigation.
- **Data viz:** donut segments snap in at fixed angular increments; count-ups quantized
  to discrete steps (odometer); heatmap stamps column-by-column in `steps(1)`.
- **Cursor: native.** CursorGlow deleted.

### 3.4 Easing & timing tokens (canonical — Motion brief wins)

| Token | Value | Use |
|---|---|---|
| `--ease-machine` | `cubic-bezier(0.65, 0, 0.35, 1)` | default: slides, rules, wipes |
| `--ease-snap` | `cubic-bezier(0.85, 0, 0.15, 1)` | rotation locks, page curtain |
| `--ease-brake` | `cubic-bezier(0.16, 1, 0.3, 1)` | entrances (rename of out-expo) |
| `--ease-stamp` | `steps(1, end)` / `steps(8)` | labels, counters, heatmap |

Duration scale on a **120ms beat**: 120/240/360/480/720ms. Stagger 60–80ms. Nothing
exceeds 720ms except the scroll-scrubbed disassembly. Keyframe zoo: ~30 → ~10 (delete
aurora, shimmer, scanline, radar, flicker, conic, glow-pulse, barberpole, boot, caret,
grid-pulse, spring).

### 3.5 Performance & accessibility

- Animate only `transform`/`opacity`/`clip-path`; `will-change` managed by GSAP.
- 3D: DPR ≤ 1.5, render-on-demand, IntersectionObserver + visibilitychange pause,
  full dispose on unmount.
- **Device tiers:** A (fine pointer, ≥6 cores) = full 3D + Lenis. B (touch/mid) = SVG
  poster + CSS gear step, GSAP reveals, native scroll. C (reduced-motion) = everything at
  final state — **a parallel design, not a kill switch**.
- **Budgets (CI gates): LCP < 1.5s throttled mid-tier mobile (1.2s desktop target),
  CLS < 0.05, INP < 200ms.** The 3D piece can fail entirely and the page is still finished.

---

## 4. Information architecture & features

### 4.1 Routes

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Single-page portfolio | Prerendered |
| `/work/:slug` | Case-study per featured project | Prerendered (ROUTES generated from content) |
| `/cv` | Print-perfect résumé, same data | Prerendered |
| `/admin`, `/admin/panel` | Editor | **Client-only, removed from prerender, noindex** |
| `*` | Real 404 (Bauhaus shapes) | Prerendered `404.html`, drop soft-404 rewrite |

### 4.2 Home section order (20-second recruiter scan)

1. **Hero** — name, one precise positioning line, location, real availability status.
2. **Selected Work** — 3–5 manually curated projects with images → case studies.
3. **Experience** — timeline (recruiters check this right after work).
4. **GitHub proof strip** — contribution calendar + language donut + streak/totals +
   "data as of {build date}" stamp.
5. **Skills** — grouped square-chip tags with context. No percentage anything.
6. **About + Education** — short, one photo, "Now building: X" status line.
7. **Contact** — email-first (copy-to-clipboard), LinkedIn, GitHub, footer colophon
   linking the repo. **No contact form** (spam surface; mailto does it better).

**Case-study structure (Comeau playbook, enforced by data model):** hero image → role &
context → the problem → technical hurdles and how you solved them → stack → outcome/users
→ links. *This narrative is THE differentiator vs. card-grid portfolios.*

**Cut:** blog (stale blog < no blog), guestbook, view counter, i18n, sound design,
Spotify now-playing, activity feed, follower counts.

### 4.3 Projects system (the "manual projects + images" requirement)

**Data model** (`content/portfolio.json`, Zod-validated):

```js
{
  slug, title, summary,           // summary ≤140 chars
  role, stack: [],
  cover: { src, alt, width, height },
  gallery: [{ src, alt, caption }],
  links: { live?, repo?, video? },
  featured: bool, order: number,
  status: 'live'|'wip'|'archived', year,
  githubRepo: 'owner/name'?,      // merges live stars/forks; dedupes the auto card
  body: markdown                   // case study
}
```

**Persistence — git-as-database (chosen after evaluating Blob/Cloudinary/manual export):**

1. Admin edits buffer in localStorage ("unsaved" label).
2. **Publish** → `POST /api/save` — client resizes/compresses images to WebP ≤1600px
   (~150–300KB) + computes ThumbHash placeholders before upload.
3. Serverless `api/save` verifies auth, validates against Zod, commits
   `content/portfolio.json` + `content/images/<slug>-<hash>.webp` in ONE commit via
   GitHub Contents/Git-Data API (fine-grained PAT, contents:write, this repo only,
   server-side env).
4. Push triggers Vercel rebuild (~1–2 min) → prerender bakes content in. Data is
   versioned in git; rollback = `git revert`. **Survives deploys by definition — it
   causes them.**

**Auth (honest):** `ADMIN_PASSWORD` server-only env; `POST /api/login` constant-time
compare + rate limit → short-lived HMAC-signed token (`SESSION_SECRET`); `api/save`
verifies it. Client-side gate stays as UX only. The write path is genuinely gated even
though the admin UI remains public forms.

**Merge/dedupe:** manual projects are first-class; GitHub repos supplement. `githubRepo`
set → live stars/forks enrich the card and the auto card is deduped. Auto repos render
below featured work as a compact "More on GitHub" list — never above manual work.

**Fallback:** fixed Export/Import (download portfolio.json + images zip for manual
commit) — ~30 lines of insurance if the PAT breaks.

### 4.4 GitHub integration

- **Fix:** star-sort bug; **never overwrite good JSON on fetch failure** (keep previous +
  warn; fail build if no prior file).
- **Add:** commit streak + total contributions (derivable from existing calendar data,
  zero API cost); per-repo enrichment for manual projects; build-date stamp.
- **Keep:** calendar, language donut, pinned repos (demoted below manual work).
- **Scheduled freshness:** weekly rebuild via Vercel cron / GitHub Action so "data as of"
  never ages badly.

### 4.5 Differentiators (ranked)

**Tier 1 — build:**
1. **Case-study pages** — highest hiring impact of anything here.
2. **Command palette (Ctrl+K, `cmdk`, lazy chunk)** — navigate, jump to projects, copy
   email, download CV, toggle paper mode. Replaces the decorative search.
3. **Build-time OG images per project** — satori/resvg generating Bauhaus-composition
   PNGs (shapes + title + stack). Every shared link becomes a branded poster.
4. **Print-perfect CV** from shared data (unify tokens; browser print-to-PDF, no
   generated asset).

**Tier 2 — cheap, characterful:**
5. **"Now building" status line** (admin-editable, 30 min).
6. **"Paper mode"** — one keystroke inverts to white-paper 1923 poster mode. Pure token
   swap; the print CV palette seeds the light tokens. *The unique touch nobody else has.*
7. **Full keyboard navigation** — anchor URLs for sections (fixes scrollIntoView a11y),
   visible focus choreography.
8. Konami shape toy (draggable shapes) — hard cap 1 day, else cut.

### 4.6 Trust layer

- JSON-LD `Person` on `/`, `SoftwareSourceCode`/`CreativeWork` per case study, injected
  at prerender.
- Per-route titles/descriptions/canonicals baked into prerendered `<head>`.
- `sitemap.xml` generated from ROUTES; `robots.txt` disallowing `/admin`.
- **Analytics: Vercel Web Analytics** (cookieless, zero-config, no banner).
- Testimonials slot rendered **only if real quotes exist**.
- Lighthouse CI in repo — performance as a visible proof-of-work artifact.

---

## 5. Engineering plan

### 5.1 Architecture decisions

- **Keep Vite 6 + React 18 + existing prerender pipeline. No Astro/Next migration** —
  prerender already delivers static SEO HTML; the one missing capability (durable writes)
  is solved by adding a Vercel `api/` directory, not a framework.
- **TypeScript: gradual.** `allowJs: true`; all NEW code (schemas, api/, 3D, content
  layer) in TS; existing JSX untouched. Zod schemas = single source of truth shared by
  admin UI, API, and build script.
- **Folder restructure:**

```
api/                  # serverless: login.ts, save.ts
content/              # portfolio.json + images/  (git-committed content)
src/
  app/                # App, routes (single ROUTES constant), ClientOnly gate
  components/ui/      # Bauhaus primitives (Rule, Shape, Marker, Button, …)
  components/three/   # lazy-only 3D (never statically imported by routes)
  features/           # dashboard/ projects/ cv/ admin/
  hooks/ lib/ styles/ data/
```

### 5.2 Dependencies

**Add:** `three@^0.170` (lazy chunk), `gsap@^3.13`, `lenis@^1.3`, `cmdk@^1.1` (lazy),
`zod@^3.24`, `thumbhash`, `@fontsource-variable/archivo`, `@fontsource/dm-sans`,
`@fontsource/chivo-mono`. (No r3f/drei — see §3.1.)

**Remove/move:** `sirv` → devDeps; delete TimelineItem (dead), `violet` alias,
Hologram3D, Constellation, Scramble, TypeWriter, CursorGlow, SystemStatus, Loader, and
all cyber CSS once replaced; `react-markdown` → lazy chunk (case studies + admin).

**Bundle targets (gz):** main ≤ ~140KB; `motion` ~38KB on hydration; `three` ~115KB on
idle, Tier-A only; `admin`/`cmdk`/`markdown` lazy.

### 5.3 Phases

| Phase | Scope | Acceptance |
|---|---|---|
| **P1 — Foundation & pipeline hygiene** | Tokens, self-hosted fonts, TS/Zod setup, ALL §1 bug fixes (star-sort, JSON preservation, dist hygiene, 404, single ROUTES constant, admin de-prerender), manualChunks scaffolding | builds green; prerender correct for all routes + 404; Lighthouse baseline recorded |
| **P2 — Layout shell** | New Sidebar/TopBar/grid in Bauhaus grammar; Lenis+GSAP wiring; reduced-motion parallel design established; mobile chassis | all routes in new shell with old content; CLS < 0.05; keyboard nav works |
| **P3 — Hero + 3D** *(highest risk — prototype in week 1)* | SVG poster (LCP) + lazy three chunk + crossfade; entrance choreography; scroll disassembly | prerendered HTML contains full hero; three absent from SSR bundle + initial waterfall; 60fps mid-range phone; reduced-motion shows poster |
| **P4 — Content sections** | Stats, skills-as-tags, contributions, experience, education, CV unification; scroll reveals; **delete cyber components/CSS** | zero cyan/rgba stragglers (grep-verified); charts have text alternatives + keyboard access |
| **P5 — Projects system + admin** *(second risk — spike Contents-API commit in week 1)* | content/ model, ProjectsEditor (upload, crop to fixed aspect, EXIF strip, reorder, feature, repo-override), api/login + api/save, merge logic, ProjectCard with images, case-study page design, export/import fallback | end-to-end publish → rebuild → image survives redeploy; API rejects bad tokens; drafts survive; 409/failed-build states handled |
| **P6 — Polish, SEO, a11y** | cmdk palette, View Transitions, OG generation, JSON-LD, sitemap, paper-mode tokens, brand mark (favicon/monogram/manifest), full axe + reduced-motion audit | Lighthouse ≥ 95 all categories; axe zero criticals |
| **P7 — Launch** | 2–5 real case-study write-ups, cross-device QA (mid-range Android), CWV verified on prod, rollback plan | owner sign-off; budgets green on production URL |

P1→P2→P3 sequential; P4 ∥ P5 after P2. **Week-1 de-risking spikes:** (a) standalone
Contents-API commit script incl. failure modes (failed build after commit, SHA races,
build-minute quotas); (b) 3D prototype on a mid-range Android.

### 5.4 Gaps the critique surfaced (owned in phases above)

- Paper-mode light palette must be spec'd token-for-token (P6; print CV seeds it) — or cut.
- Brand mark (favicon/monogram/app icons/manifest) — P6.
- Mobile chassis: sidebar → bottom/hamburger behavior, touch equivalents for all
  hover-dependent reveals (duotone→color on tap/in-view), palette access without Ctrl+K — P2.
- Case-study page layout/gallery/prose typography — P5.
- Admin failure/empty states: commit-ok-but-build-failed, stale-SHA 409, zero projects — P5.
- Draft preview before publish (local render-from-draft mode) — P5.
- Content migration: current localStorage drafts + portfolio.js seeds → content/portfolio.json — P5.
- CV download = print CSS (no generated PDF) — decided.
- Browser-support matrix: animated clip-path in Safari, View Transitions fallback — P2/P6.
- Tests: unit tests for merge/dedupe, token verification, Zod schemas — P5/P6.

---

## 6. Decisions to confirm with the owner before implementation

1. **Direction:** full commitment to Dessau Dark — the cyber/holo aesthetic is deleted,
   not blended. (Half-measures produce mud.)
2. **Git-as-database:** requires creating a fine-grained GitHub PAT and accepting
   publish = commit + ~2 min rebuild. Fallback is manual export/import.
3. **Poster-first reality:** most visitors (mobile/touch) see the SVG poster, not the
   WebGL scene. The poster must be accepted as *the* design, with 3D as a desktop upgrade.
4. **Case-study content:** the #1 differentiator needs 2–5 real write-ups from the owner.
   Draft one before P5 builds the route, or the flagship ships empty.
5. **Skills honesty:** percentage bars/meters are gone for good — replaced by grouped
   tags with years/context.
