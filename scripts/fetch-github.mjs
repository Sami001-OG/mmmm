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

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME || 'Sami001-OG'

  if (!token) {
    writeFileSync(OUTPUT, JSON.stringify({ _empty: true }))
    console.log('⏭ No GITHUB_TOKEN set. Using mock data.')
    return
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    }

    const [profileRes, reposRes, contribGraph] = await Promise.all([
      fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, { headers }),
      fetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}/repos?sort=stars&per_page=20&type=owner`, { headers }),
      (async () => {
        try { return await graphql(CONTRIB_QUERY, { username }, token) }
        catch { return null }
      })(),
    ])

    if (!profileRes.ok) throw new Error(`Profile fetch: ${profileRes.status}`)
    if (!reposRes.ok) throw new Error(`Repos fetch: ${reposRes.status}`)

    const profileData = await profileRes.json()
    const reposList = await reposRes.json()

    // Fetch per-repo language byte counts
    const langResults = await Promise.all(
      reposList
        .filter((r) => !r.fork)
        .map((r) =>
          fetch(r.languages_url, { headers })
            .then((res) => res.json())
            .catch(() => ({}))
        )
    )

    // Aggregate bytes across all repos
    const byteTotals = {}
    reposList.filter((r) => !r.fork).forEach((r, i) => {
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
    const totalStars = reposList
      .filter((r) => !r.fork)
      .reduce((sum, r) => sum + r.stargazers_count, 0)

    const repos = reposList
      .filter((r) => !r.fork)
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
      contributions = {
        totalContributions: cal.totalContributions,
        weeks: cal.weeks.map((w) =>
          w.contributionDays.map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: contributionLevel(d.contributionCount),
          }))
        ),
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
    }

    writeFileSync(OUTPUT, JSON.stringify(result, null, 2))
    console.log(`✓ Synced ${profileData.login}: ${regularRepos.length} repos (+${pinnedRepos.length} pinned), ${languages.length} languages, ${totalStars} total stars`)
  } catch (err) {
    writeFileSync(OUTPUT, JSON.stringify({ _empty: true }))
    console.log(`✗ GitHub sync failed: ${err.message}. Using mock data.`)
  }
}

main()
