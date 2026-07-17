// Generates the PNG app icons from the favicon's Bauhaus mark.
// Emits into public/: icon-192.png, icon-512.png, icon-512-maskable.png
// (artwork scaled into the ~80% safe zone so mask shapes don't clip it),
// and apple-touch-icon.png (180). Run: node scripts/generate-icons.mjs
// (also part of build:ssr). PNGs are committed, same lifecycle as og.png.

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(__dirname, '../public')

// Mirrors public/favicon.svg — bg, hairline frame, circle/triangle/square.
const art = `
  <rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="#3B3A41" stroke-width="1"/>
  <circle cx="11" cy="11" r="5" fill="#4C8DFF"/>
  <path d="M18 6 L26 6 L22 13 Z" fill="#F5C518"/>
  <rect x="17" y="17" width="9" height="9" fill="#E5484D"/>`

// Full-bleed icon (purpose: any).
const fullBleed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#111014"/>${art}
</svg>`

// Maskable: artwork shrunk to ~66% and centered so circular/squircle masks
// (safe zone = inner 80%) never clip the frame or shapes.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#111014"/>
  <g transform="translate(5.44 5.44) scale(0.66)">${art}</g>
</svg>`

const outputs = [
  { file: 'icon-192.png', svg: fullBleed, size: 192 },
  { file: 'icon-512.png', svg: fullBleed, size: 512 },
  { file: 'icon-512-maskable.png', svg: maskable, size: 512 },
  { file: 'apple-touch-icon.png', svg: fullBleed, size: 180 },
]

for (const { file, svg, size } of outputs) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(path.join(PUBLIC, file))
  console.log(`✓ Wrote public/${file} (${size}×${size})`)
}
