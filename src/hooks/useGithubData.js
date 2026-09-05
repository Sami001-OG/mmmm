import { useEffect, useState } from 'react'
import staticData from '../data/github-static.json'

const CACHE_VERSION = 'v2'
const CACHE_TTL = 60 * 60 * 1000
let inflight = new Map()

function cacheKey(username) {
  return `portfolio_github_${CACHE_VERSION}_${username}`
}

function readCache(username) {
  try {
    const raw = window.localStorage.getItem(cacheKey(username))
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (!cached.data || Date.now() - cached.cachedAt > CACHE_TTL) return null
    return cached.data
  } catch {
    return null
  }
}

function writeCache(username, data) {
  try {
    window.localStorage.setItem(cacheKey(username), JSON.stringify({ data, cachedAt: Date.now() }))
  } catch {
    // Local storage is an optimization; the API remains the source of truth.
  }
}

async function fetchLive(username) {
  if (!inflight.has(username)) {
    inflight.set(username, fetch(`/api/github?username=${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/json' },
    }).then(async (response) => {
      if (!response.ok) throw new Error(`GitHub API responded ${response.status}`)
      return response.json()
    }).finally(() => inflight.delete(username)))
  }
  return inflight.get(username)
}

async function fetchSystems() {
  const response = await fetch('/api/systems', { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Systems API responded ${response.status}`)
  return response.json()
}

export default function useGithubData(username) {
  const [state, setState] = useState(() => {
    if (!username) return { data: null, error: 'No GitHub username configured', loading: false, refreshing: false }
    const cached = typeof window !== 'undefined' ? readCache(username) : null
    const base = cached || (staticData && !staticData._empty ? staticData : null)
    return { data: base, error: null, loading: !base, refreshing: true, source: cached ? 'cache' : 'snapshot' }
  })

  useEffect(() => {
    if (!username) return undefined
    let cancelled = false
    setState((current) => ({ ...current, refreshing: true }))

    // Parallel: GitHub payload + systems status are independent.
    // Previously systems waited for GitHub (waterfall); now both race together.
    Promise.allSettled([fetchLive(username), fetchSystems()]).then(([ghRes, sysRes]) => {
      if (cancelled) return
      if (ghRes.status === 'fulfilled') {
        const data = ghRes.value
        writeCache(username, data)
        const systems = sysRes.status === 'fulfilled' ? sysRes.value : {}
        setState({
          data: { ...data, ...systems },
          error: data.refreshError || null,
          loading: false,
          refreshing: false,
          source: 'live',
        })
      } else {
        // GitHub failed but systems may still be useful; keep snapshot/cache.
        if (sysRes.status === 'fulfilled') {
          setState((current) => ({
            ...current,
            data: current.data ? { ...current.data, ...sysRes.value } : current.data,
            error: ghRes.reason?.message || 'Could not refresh GitHub data.',
            loading: false,
            refreshing: false,
          }))
        } else {
          setState((current) => ({
            ...current,
            error: ghRes.reason?.message || 'Could not refresh GitHub data.',
            loading: false,
            refreshing: false,
          }))
        }
      }
    })

    return () => { cancelled = true }
  }, [username])

  return state
}
