import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../src/data/github-static.json')
const DOTENV = resolve(__dirname, '../.env')
const GITHUB_REST = 'https://api.github.com'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'

if (existsSync(DOTENV)) {
  const content = readFileSync(DOTENV, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

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
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            id
            name
            description
            stargazerCount
            forkCount
            primaryLanguage { name }
            url
            isArchived
            repositoryTopics(first: 10) {
              nodes { topic { name } }
            }
          }
        }
      }
    }
  }
`

async function graphql(query, variables, token) {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

function contributionLevel(count) {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  if (count <= 15) return 3
  return 4
}

// Never destroy good data. On any failure, keep the previously-committed JSON
// (still fresh enough) and warn. Only emit the _empty sentinel when there was
// no prior file at all — and fail the build so a broken deploy is loud.
function keepPreviousOrFail(reason) {
  if (existsSync(OUTPUT)) {
    try {
      const prev = JSON.parse(readFileSync(OUTPUT, 'utf-8'))
      if (prev && !prev._empty) {
        console.log(`✗ ${reason}. Keeping previously-synced data.`)
        return
      }
    } catch { /* fall through to sentinel */ }
  }
  writeFileSync(OUTPUT, JSON.stringify({ _empty: true }))
  console.log(`✗ ${reason}. No prior data — wrote _empty sentinel.`)
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME || 'Sami001-OG'

  if (!token) {
    keepPreviousOrFail('No GITHUB_TOKEN set')
    return
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    }

    const [profileRes, reposRes, contribGraph] = await Promise.all([
      fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, { headers }),
      // NOTE: `sort=stars` is NOT a valid REST param (valid: created/updated/pushed/
      // full_name) — it silently sorted alphabetically. Fetch by recency, then
      // sort by stars client-side below.
      fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100&type=owner`, { headers }),
      (async () => {
        try { return await graphql(CONTRIB_QUERY, { username }, token) }
        catch { return null }
      })(),
    ])

    if (!profileRes.ok) throw new Error(`Profile fetch: ${profileRes.status}`)
    if (!reposRes.ok) throw new Error(`Repos fetch: ${reposRes.status}`)

    const profileData = await profileRes.json()
    const reposList = (await reposRes.json())
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)

    // Fetch per-repo language byte counts (reposList is already fork-free).
    const langResults = await Promise.all(
      reposList.map((r) =>
        fetch(r.languages_url, { headers })
          .then((res) => res.json())
          .catch(() => ({}))
      )
    )

    // Aggregate bytes across all repos
    const byteTotals = {}
    reposList.forEach((r, i) => {
      for (const [lang, bytes] of Object.entries(langResults[i])) {
        byteTotals[lang] = (byteTotals[lang] || 0) + bytes
      }
    })

    const totalBytes = Object.values(byteTotals).reduce((a, b) => a + b, 0)
    const languages = Object.entries(byteTotals)
      .map(([name, bytes]) => ({
        name,
        percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .filter((l) => l.percentage >= 1)

    // Build repos with topics
    const totalStars = reposList.reduce((sum, r) => sum + r.stargazers_count, 0)

    const repos = reposList
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        title: r.name,
        description: r.description || 'No description provided.',
        tags: [r.language, ...(r.topics || [])].filter(Boolean),
        status: r.archived ? 'Archived' : 'Live',
        statusColor: r.archived ? 'surface' : 'emerald',
        stars: r.stargazers_count,
        forks: r.forks_count,
        href: r.html_url,
        updatedAt: r.pushed_at,
      }))

    // Contribution calendar
    let contributions = null
    if (contribGraph?.user?.contributionsCollection?.contributionCalendar) {
      const cal = contribGraph.user.contributionsCollection.contributionCalendar
      const weeks = cal.weeks.map((w) =>
        w.contributionDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: contributionLevel(d.contributionCount),
        }))
      )
      // Derive streaks from the flat day list (zero extra API cost).
      const days = weeks.flat()
      let currentStreak = 0
      let longestStreak = 0
      let run = 0
      for (const d of days) {
        if (d.count > 0) { run++; longestStreak = Math.max(longestStreak, run) }
        else run = 0
      }
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].count > 0) currentStreak++
        else break
      }
      contributions = {
        totalContributions: cal.totalContributions,
        currentStreak,
        longestStreak,
        weeks,
      }
    }

    // Pinned repos
    const pinnedRaw = contribGraph?.user?.pinnedItems?.nodes || []
    const pinnedIds = new Set(pinnedRaw.map((p) => p.id))
    const pinnedRepos = pinnedRaw.filter(Boolean).map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description || repos.find((r) => r.id === p.id)?.description || 'No description provided.',
      tags: [p.primaryLanguage?.name, ...(p.repositoryTopics?.nodes?.map((t) => t.topic.name) || [])].filter(Boolean),
      status: p.isArchived ? 'Archived' : 'Live',
      statusColor: p.isArchived ? 'surface' : 'emerald',
      stars: p.stargazerCount,
      forks: p.forkCount,
      href: p.url,
    }))

    // Remove pinned from regular list
    const regularRepos = repos.filter((r) => !pinnedIds.has(r.id))

    const result = {
      avatarUrl: profileData.avatar_url,
      name: profileData.name || username,
      login: profileData.login,
      bio: profileData.bio || '',
      location: profileData.location || '',
      twitter: profileData.twitter_username || '',
      blog: profileData.blog || '',
      email: profileData.email || '',
      followers: profileData.followers,
      following: profileData.following,
      publicRepos: profileData.public_repos,
      totalStars,
      pinnedRepos,
      repos: regularRepos,
      languages,
      contributions,
      // Build-date stamp — surfaced as "data as of {date}" in the UI so the
      // static snapshot never looks stale-but-unlabeled.
      fetchedAt: process.env.BUILD_DATE || new Date().toISOString().slice(0, 10),
    }

    writeFileSync(OUTPUT, JSON.stringify(result, null, 2))
    console.log(`✓ Synced ${profileData.login}: ${regularRepos.length} repos (+${pinnedRepos.length} pinned), ${languages.length} languages, ${totalStars} total stars`)
  } catch (err) {
    keepPreviousOrFail(`GitHub sync failed: ${err.message}`)
  }
}

main()
