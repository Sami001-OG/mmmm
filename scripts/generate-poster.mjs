// Generates public/poster.png — "the year in code" as a print-grade Bauhaus
// artifact, rendered at build time from github-static.json.
// Run: node scripts/generate-poster.mjs
//
// NOTE: visitors download the poster live from /api/poster (fresh GitHub data
// on every click). This build-time PNG is the offline/local fallback.

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { buildPosterSVG } from './poster-svg.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.resolve(__dirname, '../src/data/github-static.json')
const OUT = path.resolve(__dirname, '../public/poster.png')

let gh = {}
try { gh = JSON.parse(readFileSync(DATA, 'utf-8')) } catch { /* empty build */ }
if (gh._empty) gh = {}

const svg = buildPosterSVG({
  name: (gh.name || 'sami').toLowerCase(),
  login: gh.login || 'Sami001-OG',
  weeks: gh.contributions?.weeks || [],
  totalContributions: gh.contributions?.totalContributions || 0,
  repoCount: gh.publicRepos ?? (gh.repos?.length || 0) + (gh.pinnedRepos?.length || 0),
  totalStars: gh.totalStars || 0,
  languages: gh.languages || [],
  year: new Date().getFullYear(),
})

await sharp(Buffer.from(svg), { density: 144 }).png().toFile(OUT)
console.log(`✓ Wrote public/poster.png (${new Date().getFullYear()} annual report)`)
