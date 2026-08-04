// Shared poster SVG builder — "the year in code" as a print-grade Bauhaus
// artifact: the GitHub contribution calendar woven into the grid, languages
// as proportional color bars, stat plate at the foot.
//
// Used by:
//   scripts/generate-poster.mjs  → build-time PNG (sharp) from github-static.json
//   api/poster.mjs               → on-demand PNG with LIVE GitHub data
//
// A2-proportioned portrait at 1191×1684 (1/4 print scale, crisp on screens).

const BG = '#111014'
const LINE = '#2A2930'
const LINE_STRONG = '#3B3A41'
const INK = '#F2F0EB'
const DIM = '#A5A2A9'
const FAINT = '#6E6B73'
const RED = '#E5484D'
const YELLOW = '#F5C518'
const BLUE = '#4C8DFF'

const LANG_COLORS = {
  TypeScript: BLUE, JavaScript: YELLOW, Python: '#3E7CB1', HTML: RED,
  CSS: '#7AA7FF', Shell: '#89E051', C: '#555555', 'C++': '#F34B7D',
}
const FALLBACK = [BLUE, RED, YELLOW, '#7AA7FF', '#FF6B5B']

const W = 1191
const H = 1684
const M = 84 // outer margin

const LEVELS = ['none', 'rgba(76,141,255,0.28)', 'rgba(76,141,255,0.55)', BLUE, YELLOW]

function levelFor(count, max) {
  if (!count) return 0
  const r = count / Math.max(max, 1)
  if (r > 0.75) return 4
  if (r > 0.5) return 3
  if (r > 0.2) return 2
  return 1
}

export function buildPosterSVG({
  name = 'sami',
  login = 'Sami001-OG',
  weeks = [],
  totalContributions = 0,
  repoCount = 0,
  totalStars = 0,
  languages = [],
  year = new Date().getFullYear(),
} = {}) {
  // ── Contribution field: the year's calendar as filled grid cells ─────────
  // 53 columns × 7 rows, square cells; intensity maps to the four-step scale.
  const gridW = W - M * 2
  const cell = Math.floor(gridW / 53)
  const cellGap = 3
  const contribX = M
  const contribY = 430

  let maxDay = 1
  for (const w of weeks) for (const d of w.days || []) maxDay = Math.max(maxDay, d.count || 0)

  const contribCells = weeks.slice(0, 53).map((w, wi) =>
    (w.days || []).map((d, di) => {
      const lvl = levelFor(d.count || 0, maxDay)
      const x = contribX + wi * cell
      const y = contribY + di * cell
      if (lvl === 0) {
        return `<rect x="${x}" y="${y}" width="${cell - cellGap}" height="${cell - cellGap}" fill="none" stroke="${LINE}" stroke-width="1"/>`
      }
      return `<rect x="${x}" y="${y}" width="${cell - cellGap}" height="${cell - cellGap}" fill="${LEVELS[lvl]}"/>`
    }).join('')
  ).join('\n  ')

  const contribH = cell * 7

  // ── Language composition bar ──────────────────────────────────────────────
  const barY = contribY + contribH + 150
  const barH = 64
  let acc = 0
  const langSegs = languages.map((l, i) => {
    const w = (l.percentage / 100) * gridW
    const x = M + acc
    acc += w
    const color = LANG_COLORS[l.name] || FALLBACK[i % FALLBACK.length]
    return `<rect x="${x}" y="${barY}" width="${Math.max(w - 3, 2)}" height="${barH}" fill="${color}"/>`
  }).join('\n  ')

  const langLabels = (() => {
    let lx = 0
    return languages.map((l, i) => {
      const w = (l.percentage / 100) * gridW
      const x = M + lx
      lx += w
      if (w < 90) return '' // too narrow to label
      const color = LANG_COLORS[l.name] || FALLBACK[i % FALLBACK.length]
      return `<text x="${x}" y="${barY + barH + 34}" font-family="'Chivo Mono', monospace" font-size="15" letter-spacing="1.5" fill="${color}">${l.name.toUpperCase()} ${l.percentage}%</text>`
    }).join('\n  ')
  })()

  // ── Stat plate ────────────────────────────────────────────────────────────
  const plateY = barY + barH + 120
  const stats = [
    { label: 'CONTRIBUTIONS', value: totalContributions, accent: BLUE },
    { label: 'REPOSITORIES', value: repoCount, accent: YELLOW },
    { label: 'STARS EARNED', value: totalStars, accent: RED },
  ]
  const plateW = (gridW - 48) / 3
  const statPlates = stats.map((s, i) => {
    const x = M + i * (plateW + 24)
    return `
  <rect x="${x}" y="${plateY}" width="${plateW}" height="150" fill="none" stroke="${LINE_STRONG}" stroke-width="1.5"/>
  <rect x="${x}" y="${plateY}" width="${plateW}" height="5" fill="${s.accent}"/>
  <text x="${x + 24}" y="${plateY + 48}" font-family="'Chivo Mono', monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">${s.label}</text>
  <text x="${x + 22}" y="${plateY + 118}" font-family="'Archivo Black', 'Arial Black', sans-serif" font-size="58" fill="${INK}">${s.value}</text>`
  }).join('\n')

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  ${Array.from({ length: 11 }, (_, i) => {
    const x = ((i + 1) * W) / 12
    return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${LINE}" stroke-width="1" opacity="0.4"/>`
  }).join('\n  ')}

  <rect x="${M / 2}" y="${M / 2}" width="${W - M}" height="${H - M}" fill="none" stroke="${LINE_STRONG}" stroke-width="2"/>

  <!-- Logo primitives -->
  <circle cx="${M + 40}" cy="${M + 52}" r="26" fill="${BLUE}"/>
  <path d="M${M + 84} ${M + 26} L${M + 136} ${M + 26} L${M + 110} ${M + 72} Z" fill="${YELLOW}"/>
  <rect x="${M + 152}" y="${M + 30}" width="44" height="44" fill="${RED}"/>

  <text x="${W - M}" y="${M + 46}" text-anchor="end" font-family="'Chivo Mono', monospace" font-size="17" letter-spacing="3" fill="${DIM}">ANNUAL REPORT — ${year}</text>
  <text x="${W - M}" y="${M + 74}" text-anchor="end" font-family="'Chivo Mono', monospace" font-size="17" letter-spacing="3" fill="${FAINT}">GITHUB/${String(login).toUpperCase()}</text>

  <!-- Wordmark -->
  <text x="${M - 8}" y="330" font-family="'Archivo Black', 'Arial Black', sans-serif" font-size="190" fill="${INK}">${name}</text>
  <rect x="${M}" y="356" width="230" height="10" fill="${YELLOW}"/>
  <text x="${M}" y="405" font-family="'Chivo Mono', monospace" font-size="19" letter-spacing="4" fill="${DIM}">A YEAR IN CODE — EVERY DAY, RECORDED</text>

  <!-- Contribution field -->
  ${contribCells}
  <text x="${M}" y="${contribY + contribH + 44}" font-family="'Chivo Mono', monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">FIG 01 — CONTRIBUTION CALENDAR · ${totalContributions} COMMITS/PRS/ISSUES</text>

  <!-- Language composition -->
  <text x="${M}" y="${barY - 28}" font-family="'Chivo Mono', monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">FIG 02 — LANGUAGE COMPOSITION BY CODE VOLUME</text>
  ${langSegs}
  ${langLabels}

  <!-- Stat plates -->
  ${statPlates}

  <!-- Foot rule -->
  <line x1="${M}" y1="${H - 150}" x2="${W - M}" y2="${H - 150}" stroke="${LINE_STRONG}" stroke-width="1.5"/>
  <text x="${M}" y="${H - 108}" font-family="'Chivo Mono', monospace" font-size="15" letter-spacing="2.5" fill="${DIM}">PORTFOLIOFSAMI.VERCEL.APP</text>
  <text x="${W - M}" y="${H - 108}" text-anchor="end" font-family="'Chivo Mono', monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">DHAKA, BANGLADESH · UNIT PORTFOLIO-01</text>
</svg>`
}
