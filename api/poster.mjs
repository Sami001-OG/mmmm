// Vercel serverless function — serves the year-in-code poster as a PNG built
// from LIVE GitHub data on every request, so contributions / repos / stars are
// always current (nothing hardcoded, nothing stale).
//
//   GET /api/poster → image/png attachment
//
// Live pieces:
//   - profile + repos + stars  → REST (public endpoints, no auth needed)
//   - contribution calendar    → GraphQL (needs GITHUB_TOKEN, already set on
//                                Vercel for fetch-github.mjs at build time)
// Languages stay from the build snapshot (byte aggregation = many extra REST
// calls); everything else is refreshed per download. Any failed piece falls
// back to the snapshot, and if sharp ever fails the committed public/poster.png
// is served instead — the download can never 500.

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { buildPosterSVG } from '../scripts/poster-svg.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STATIC = resolve(__dirname, '../src/data/github-static.json')
const FALLBACK_PNG = resolve(__dirname, '../public/poster.png')

const GITHUB_REST = 'https://api.github.com'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

const CONTRIB_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`

function contributionLevel(count) {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  if (count <= 15) return 3
  return 4
}

function loadStatic() {
  try {
    const gh = JSON.parse(readFileSync(STATIC, 'utf-8'))
    return gh && !gh._empty ? gh : {}
  } catch {
    return {}
  }
}

async function fetchLive(username, token) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let [profileRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, { headers }),
    fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100&type=owner`, { headers }),
  ])

  // Revoked/expired token → retry the public REST endpoints without auth so
  // profile/repos/stars stay live (contributions then fall back to snapshot,
  // since GraphQL needs a valid token).
  if (token && (profileRes.status === 401 || reposRes.status === 401)) {
    const anon = { Accept: 'application/vnd.github.v3+json' }
    ;[profileRes, reposRes] = await Promise.all([
      fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, { headers: anon }),
      fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100&type=owner`, { headers: anon }),
    ])
    token = null
  }

  const live = {}
  if (profileRes.ok && reposRes.ok) {
    const profile = await profileRes.json()
    const repos = (await reposRes.json()).filter((r) => !r.fork)
    live.name = profile.name || username
    live.login = profile.login
    live.repoCount = profile.public_repos
    live.totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
  }

  if (token) {
    try {
      const res = await fetch(GITHUB_GRAPHQL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: CONTRIB_QUERY, variables: { username } }),
      })
      const json = await res.json()
      const cal = json?.data?.user?.contributionsCollection?.contributionCalendar
      if (cal) {
        live.totalContributions = cal.totalContributions
        live.weeks = cal.weeks.map((w) =>
          w.contributionDays.map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: contributionLevel(d.contributionCount),
          }))
        )
      }
    } catch { /* contributions fall back to snapshot */ }
  }

  return live
}

function sendPng(res, buffer, year) {
  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Content-Disposition', `attachment; filename="sami-${year}.png"`)
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(buffer)
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME || 'Sami001-OG'
  const year = new Date().getFullYear()

  const staticData = loadStatic()
  let live = {}
  try { live = await fetchLive(username, token) } catch { /* all-static fallback */ }

  const data = { ...staticData, ...live }
  // Snapshot nests contributions under `contributions`; live fetch returns
  // them at top level — accept both shapes.
  const snapshotContribs = data.contributions || {}
  const svg = buildPosterSVG({
    name: (data.name || 'sami').toLowerCase(),
    login: data.login || username,
    weeks: data.weeks || snapshotContribs.weeks || [],
    totalContributions: data.totalContributions ?? snapshotContribs.totalContributions ?? 0,
    repoCount: data.repoCount ?? (data.repos?.length || 0) + (data.pinnedRepos?.length || 0),
    totalStars: data.totalStars || 0,
    languages: data.languages || [],
    year,
  })

  try {
    const png = await sharp(Buffer.from(svg), { density: 144 }).png().toBuffer()
    sendPng(res, png, year)
  } catch {
    try {
      sendPng(res, readFileSync(FALLBACK_PNG), year)
    } catch {
      res.status(500).json({ error: 'Poster unavailable.' })
    }
  }
}
