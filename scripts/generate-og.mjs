// Generates public/og.png (1200×630) — the social share card.
// Same Bauhaus grammar as the site: warm off-black field, ruled hairlines,
// the three logo primitives, and a heavy lowercase "sami" wordmark.
// Run: node scripts/generate-og.mjs  (also part of build:ssr)

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../public/og.png')

// Palette — mirrors tailwind.config.js tokens.
const BG = '#111014'
const LINE = '#2A2930'
const LINE_STRONG = '#3B3A41'
const INK = '#F2F0EB'
const DIM = '#A5A2A9'
const RED = '#E5484D'
const YELLOW = '#F5C518'
const BLUE = '#4C8DFF'

const W = 1200
const H = 630

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Ruled grid field (12-col hairlines, like the site backdrop) -->
  ${Array.from({ length: 11 }, (_, i) => {
    const x = ((i + 1) * W) / 12
    return `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${LINE}" stroke-width="1" opacity="0.5"/>`
  }).join('\n  ')}
  <line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="${LINE}" stroke-width="1" opacity="0.5"/>

  <!-- Outer frame -->
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${LINE_STRONG}" stroke-width="2"/>

  <!-- Logo primitives, top-left: circle (data), triangle (action), square (work) -->
  <circle cx="120" cy="130" r="36" fill="${BLUE}"/>
  <path d="M196 94 L268 94 L232 158 Z" fill="${YELLOW}"/>
  <rect x="300" y="94" width="72" height="72" fill="${RED}"/>

  <!-- Mono kicker -->
  <text x="96" y="286" font-family="'Chivo Mono','Consolas',monospace" font-size="26"
        letter-spacing="6" fill="${DIM}">PORTFOLIO — DEVELOPER</text>

  <!-- Wordmark -->
  <text x="88" y="452" font-family="'Archivo Black','Arial Black','Archivo',sans-serif"
        font-size="200" font-weight="900" letter-spacing="-6" fill="${INK}">sami</text>

  <!-- Baseline rule under the wordmark, yellow accent segment -->
  <line x1="96" y1="492" x2="${W - 96}" y2="492" stroke="${LINE_STRONG}" stroke-width="2"/>
  <rect x="96" y="488" width="180" height="8" fill="${YELLOW}"/>

  <!-- Footer meta -->
  <text x="96" y="548" font-family="'Chivo Mono','Consolas',monospace" font-size="22"
        letter-spacing="4" fill="${DIM}">DHAKA, BANGLADESH · GITHUB/SAMI001-OG</text>

  <!-- Corner registration mark, bottom-right -->
  <rect x="${W - 120}" y="${H - 120}" width="24" height="24" fill="none" stroke="${INK}" stroke-width="2"/>
  <circle cx="${W - 156}" cy="${H - 108}" r="7" fill="${BLUE}"/>
</svg>`

await sharp(Buffer.from(svg), { density: 96 }).png().toFile(OUT)
console.log(`✓ Wrote ${path.relative(path.resolve(__dirname, '..'), OUT)} (${W}×${H})`)
