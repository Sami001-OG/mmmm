// Client-side poster SVG builder — "the year in code" as a print-grade Bauhaus
// artifact. Works in the browser (no Node.js APIs, no sharp). The download
// handler in Dashboard.jsx feeds it LIVE data from useGithubData() so repos,
// stars, and name are always current; contributions/languages come from the
// build-time snapshot (same data the page already shows).

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
const M = 84
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
    return languages.map((l) => {
      const w = (l.percentage / 100) * gridW
      const x = M + lx
      lx += w
      if (w < 90) return ''
      const color = LANG_COLORS[l.name] || FALLBACK[0]
      return `<text x="${x}" y="${barY + barH + 34}" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="15" letter-spacing="1.5" fill="${color}">${l.name.toUpperCase()} ${l.percentage}%</text>`
    }).join('\n  ')
  })()

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
  <text x="${x + 24}" y="${plateY + 48}" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">${s.label}</text>
  <text x="${x + 22}" y="${plateY + 118}" font-family="'Archivo Variable', 'Archivo Black', 'Arial Black', sans-serif" font-weight="900" font-size="58" fill="${INK}">${s.value}</text>`
  }).join('\n')

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  ${Array.from({ length: 11 }, (_, i) => {
    const x = ((i + 1) * W) / 12
    return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${LINE}" stroke-width="1" opacity="0.4"/>`
  }).join('\n  ')}

  <rect x="${M / 2}" y="${M / 2}" width="${W - M}" height="${H - M}" fill="none" stroke="${LINE_STRONG}" stroke-width="2"/>

  <circle cx="${M + 40}" cy="${M + 52}" r="26" fill="${BLUE}"/>
  <path d="M${M + 84} ${M + 26} L${M + 136} ${M + 26} L${M + 110} ${M + 72} Z" fill="${YELLOW}"/>
  <rect x="${M + 152}" y="${M + 30}" width="44" height="44" fill="${RED}"/>

  <text x="${W - M}" y="${M + 46}" text-anchor="end" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="17" letter-spacing="3" fill="${DIM}">ANNUAL REPORT — ${year}</text>
  <text x="${W - M}" y="${M + 74}" text-anchor="end" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="17" letter-spacing="3" fill="${FAINT}">GITHUB/${String(login).toUpperCase()}</text>

  <text x="${M - 8}" y="330" font-family="'Archivo Variable', 'Archivo Black', 'Arial Black', sans-serif" font-weight="900" font-size="190" fill="${INK}">${name}</text>
  <rect x="${M}" y="356" width="230" height="10" fill="${YELLOW}"/>
  <text x="${M}" y="405" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="19" letter-spacing="4" fill="${DIM}">A YEAR IN CODE — EVERY DAY, RECORDED</text>

  ${contribCells}
  <text x="${M}" y="${contribY + contribH + 44}" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">FIG 01 — CONTRIBUTION CALENDAR · ${totalContributions} COMMITS/PRS/ISSUES</text>

  <text x="${M}" y="${barY - 28}" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">FIG 02 — LANGUAGE COMPOSITION BY CODE VOLUME</text>
  ${langSegs}
  ${langLabels}

  ${statPlates}

  <line x1="${M}" y1="${H - 150}" x2="${W - M}" y2="${H - 150}" stroke="${LINE_STRONG}" stroke-width="1.5"/>
  <text x="${M}" y="${H - 108}" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="15" letter-spacing="2.5" fill="${DIM}">PORTFOLIOFSAMI.VERCEL.APP</text>
  <text x="${W - M}" y="${H - 108}" text-anchor="end" font-family="'Chivo Mono Variable', 'Chivo Mono', ui-monospace, monospace" font-size="15" letter-spacing="2.5" fill="${FAINT}">DHAKA, BANGLADESH · UNIT PORTFOLIO-01</text>
</svg>`
}

export function downloadPoster(data) {
  const svg = buildPosterSVG(data)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sami-${new Date().getFullYear()}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

const SCALE = 3 // 1191×1684 → 3573×5052, print-crisp

// Renders the poster to a PNG via an offscreen canvas. Returns true on
// success, false if the browser can't rasterize (falls back to SVG).
export async function downloadPosterPNG(data) {
  try {
    if (typeof document === 'undefined' || typeof Image === 'undefined') return false
    const svg = buildPosterSVG(data)
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))

    try {
      // Wait for the poster fonts so text rasterizes correctly.
      if (document.fonts?.ready) {
        await Promise.all([
          document.fonts.ready,
          document.fonts.load("12px 'Archivo Variable'").catch(() => {}),
          document.fonts.load("12px 'Chivo Mono Variable'").catch(() => {}),
        ])
      }

      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      const canvas = document.createElement('canvas')
      canvas.width = W * SCALE
      canvas.height = H * SCALE
      const ctx = canvas.getContext('2d')
      ctx.scale(SCALE, SCALE)
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)
      ctx.drawImage(img, 0, 0, W, H)

      const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!png) return false
      const pngUrl = URL.createObjectURL(png)
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `sami-${new Date().getFullYear()}.png`
      a.click()
      URL.revokeObjectURL(pngUrl)
      return true
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return false
  }
}
