import { useEffect, useState } from 'react'
import staticData from '../data/github-static.json'

const CACHE_KEY = 'portfolio_github_live'
const CACHE_TTL = 6 * 60 * 60 * 1000
const GITHUB_API = 'https://api.github.com'

// Shared across hook instances so Dashboard + CV + admin never fetch twice.
let inflight = null

function normUrl(url) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function toRepo(r) {
  return {
    id: r.id,
    title: r.name,
    description: r.description || 'No description provided.',
    tags: [r.language, ...(r.topics || [])].filter(Boolean),
    status: r.archived ? 'Archived' : 'Live',
    statusColor: r.archived ? 'surface' : 'emerald',
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    href: r.html_url,
    homepage: normUrl(r.homepage),
    createdAt: r.created_at,
    updatedAt: r.pushed_at,
  }
}

function readCache() {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.data || !parsed.fetchedAt) return null
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }))
  } catch {
    /* private mode — cache is a nicety, not a requirement */
  }
}

async function fetchLive(username) {
  const headers = { Accept: 'application/vnd.github.v3+json' }
  const [profileRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`, { headers }),
    fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100&type=owner`, { headers }),
  ])
  if (!profileRes.ok || !reposRes.ok) {
    throw new Error(`GitHub responded ${profileRes.status} / ${reposRes.status}`)
  }
  const profile = await profileRes.json()
  const reposList = (await reposRes.json())
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 12)
    .map(toRepo)

  return {
    avatarUrl: profile.avatar_url,
    name: profile.name || username,
    login: profile.login,
    bio: profile.bio || '',
    location: profile.location || '',
    blog: profile.blog || '',
    twitter: profile.twitter_username || '',
    email: profile.email || '',
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.public_repos,
    repos: reposList,
    totalStars: reposList.reduce((sum, r) => sum + r.stars, 0),
  }
}

// Live pieces (profile + repos) win; GraphQL-only pieces (contributions,
// pinned, byte-based languages, uptime pings) fall back to the build-time
// snapshot. Never throws — on any failure the cached/static data stands.
async function refresh(username) {
  const live = await fetchLive(username)
  const base = staticData && !staticData._empty ? staticData : {}
  const data = {
    ...base,
    ...live,
    languages: base.languages || [],
    contributions: base.contributions || null,
    pinnedRepos: base.pinnedRepos || [],
    systems: base.systems || [],
    fetchedAt: new Date().toISOString().slice(0, 10),
  }
  writeCache(data)
  return data
}

export default function useGithubData(username) {
  const [state, setState] = useState(() => {
    if (!username) return { data: null, error: 'No GitHub username configured' }
    const cached = readCache()
    if (cached) return { data: cached, error: null }
    const base = staticData && !staticData._empty ? staticData : null
    if (base) return { data: base, error: null, loading: true }
    return { data: null, error: null, loading: true }
  })

  useEffect(() => {
    if (!username) return
    let cancelled = false

    if (!inflight) {
      inflight = refresh(username)
        .catch(() => null)
        .finally(() => { inflight = null })
    }
    inflight.then((data) => {
      if (cancelled) return
      if (data) {
        setState({ data, error: null, loading: false })
      } else {
        setState((s) => (s.data ? s : { ...s, error: 'Could not reach GitHub — showing the last snapshot.', loading: false }))
      }
    })

    return () => { cancelled = true }
  }, [username])

  return state
}
