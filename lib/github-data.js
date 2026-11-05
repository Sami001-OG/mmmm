const GITHUB_REST = 'https://api.github.com'
const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const DISPLAY_REPO_LIMIT = 12

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
            homepageUrl
            createdAt
            pushedAt
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

function normUrl(url) {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function pagesUrl(repo) {
  // GitHub Pages deployments (the repo's "Pages" setting) are live sites
  // GitHub already knows about — use them as the homepage when no "Website"
  // URL is set, so deployed projects always get a Live button.
  if (!repo.has_pages || !repo.owner?.login) return ''
  const owner = repo.owner.login.toLowerCase()
  // The profile repo (owner/owner) serves at the bare github.io domain.
  if (owner === repo.name.toLowerCase()) return `https://${owner}.github.io/`
  return `https://${owner}.github.io/${repo.name}/`
}

function contributionLevel(count) {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  if (count <= 15) return 3
  return 4
}

async function githubFetch(url, token, options = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}))
    throw new Error(detail.message || `GitHub request failed (${response.status})`)
  }
  return response
}

async function fetchAllRepos(username, token) {
  const repos = []
  for (let page = 1; ; page += 1) {
    const response = await githubFetch(
      `${GITHUB_REST}/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100&type=owner&page=${page}`,
      token
    )
    const batch = await response.json()
    repos.push(...batch)
    if (batch.length < 100) break
  }
  return repos.filter((repo) => !repo.fork)
}

async function fetchGraphql(username, token) {
  if (!token) return null
  const response = await githubFetch(GITHUB_GRAPHQL, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: CONTRIB_QUERY, variables: { username } }),
  })
  const payload = await response.json()
  if (payload.errors?.length) throw new Error(payload.errors[0].message)
  return payload.data
}

function toRepo(repo) {
  return {
    id: repo.id,
    title: repo.name,
    description: repo.description || 'No description provided.',
    tags: [repo.language, ...(repo.topics || [])].filter(Boolean),
    status: repo.archived ? 'Archived' : 'Live',
    statusColor: repo.archived ? 'surface' : 'emerald',
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    href: repo.html_url,
    homepage: normUrl(repo.homepage) || pagesUrl(repo),
    createdAt: repo.created_at,
    updatedAt: repo.pushed_at,
  }
}

function toPinnedRepo(repo, pagesByRepo) {
  return {
    id: repo.id,
    title: repo.name,
    description: repo.description || 'No description provided.',
    tags: [repo.primaryLanguage?.name, ...(repo.repositoryTopics?.nodes?.map((node) => node.topic.name) || [])].filter(Boolean),
    status: repo.isArchived ? 'Archived' : 'Live',
    statusColor: repo.isArchived ? 'surface' : 'emerald',
    stars: repo.stargazerCount || 0,
    forks: repo.forkCount || 0,
    href: repo.url,
    // GraphQL pinned repos carry no has_pages — supplement from the REST list.
    homepage: normUrl(repo.homepageUrl) || pagesByRepo?.get(repo.name.toLowerCase()) || '',
    createdAt: repo.createdAt,
    updatedAt: repo.pushedAt,
  }
}

function buildContributions(graphData) {
  const calendar = graphData?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) return null

  const weeks = calendar.weeks.map((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: contributionLevel(day.contributionCount),
    }))
  )
  const days = weeks.flat()
  let longestStreak = 0
  let run = 0
  for (const day of days) {
    if (day.count > 0) {
      run += 1
      longestStreak = Math.max(longestStreak, run)
    } else {
      run = 0
    }
  }

  let end = days.length - 1
  const today = new Date().toISOString().slice(0, 10)
  if (days[end]?.date === today && days[end]?.count === 0) end -= 1
  let currentStreak = 0
  for (let index = end; index >= 0 && days[index]?.count > 0; index -= 1) currentStreak += 1

  return {
    totalContributions: calendar.totalContributions,
    currentStreak,
    longestStreak,
    weeks,
  }
}

async function buildLanguages(repos, token) {
  // Concurrency-capped: same results, fewer parallel sockets + faster cold builds.
  // No feature change — byte totals and percentages are identical.
  const byteTotals = {}
  const queue = [...repos]
  const CONCURRENCY = 4
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const repo = queue.shift()
      if (!repo) break
      try {
        const response = await githubFetch(repo.languages_url, token)
        const languages = await response.json()
        for (const [name, bytes] of Object.entries(languages)) {
          if (typeof bytes === 'number') byteTotals[name] = (byteTotals[name] || 0) + bytes
        }
      } catch {
        // Single repo failure never fails the whole language rollup.
      }
    }
  })
  await Promise.all(workers)
  const totalBytes = Object.values(byteTotals).reduce((sum, bytes) => sum + bytes, 0)
  return Object.entries(byteTotals)
    .map(([name, bytes]) => ({ name, percentage: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0 }))
    .filter((language) => language.percentage >= 1)
    .sort((a, b) => b.percentage - a.percentage)
}

export async function getGithubData({ username, token, previous = {} }) {
  let activeToken = token
  let profileResponse
  let repos
  let graphResult
  try {
    ;[profileResponse, repos, graphResult] = await Promise.all([
      githubFetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, activeToken),
      fetchAllRepos(username, activeToken),
      fetchGraphql(username, activeToken).catch(() => null),
    ])
  } catch (error) {
    if (!activeToken || !/Bad credentials/i.test(error.message)) throw error
    activeToken = null
    ;[profileResponse, repos] = await Promise.all([
      githubFetch(`${GITHUB_REST}/users/${encodeURIComponent(username)}`, null),
      fetchAllRepos(username, null),
    ])
    graphResult = null
  }
  const profile = await profileResponse.json()
  const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)
  const languages = await buildLanguages(sortedRepos, activeToken)
  const graphPinned = graphResult?.user?.pinnedItems?.nodes?.filter(Boolean)
  // Pages URLs keyed by repo name (lowercase) — pinned repos come from GraphQL,
  // which lacks has_pages, so their Pages status is supplemented from REST.
  const pagesByRepo = new Map(
    repos.map((repo) => [repo.name.toLowerCase(), pagesUrl(repo)]).filter(([, url]) => url)
  )
  const pinnedRepos = graphPinned?.length
    ? graphPinned.map((repo) => toPinnedRepo(repo, pagesByRepo))
    : (previous.pinnedRepos || [])
  const pinnedTitles = new Set(pinnedRepos.map((repo) => repo.title.toLowerCase()))
  const regularRepos = sortedRepos
    .filter((repo) => !pinnedTitles.has(repo.name.toLowerCase()))
    .slice(0, DISPLAY_REPO_LIMIT)
    .map(toRepo)
  const fetchedAt = new Date().toISOString()

  return {
    avatarUrl: profile.avatar_url,
    name: profile.name || username,
    login: profile.login,
    bio: profile.bio || '',
    location: profile.location || '',
    twitter: profile.twitter_username || '',
    blog: normUrl(profile.blog),
    email: profile.email || '',
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.public_repos,
    totalStars: sortedRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    pinnedRepos,
    repos: regularRepos,
    languages: languages.length ? languages : (previous.languages || []),
    contributions: buildContributions(graphResult) || previous.contributions || null,
    fetchedAt,
    githubFetchedAt: fetchedAt,
    contributionsFetchedAt: graphResult ? fetchedAt : previous.contributionsFetchedAt || previous.fetchedAt || null,
  }
}

export function getSystemTargets(data, manualProjects = [], repoLinks = {}) {
  const targets = []
  const seen = new Set()
  for (const repo of [...(data.pinnedRepos || []), ...(data.repos || [])]) {
    // Admin-curated links (repoLinks, keyed by repo name) override the repo's
    // GitHub "Website" field.
    const homepage = normUrl(repoLinks[repo.title.toLowerCase()] || repo.homepage)
    if (homepage && !seen.has(homepage)) {
      seen.add(homepage)
      targets.push({ name: repo.title, url: homepage })
    }
  }
  for (const project of manualProjects) {
    const url = project?.href && project.href !== '#' ? normUrl(project.href) : ''
    if (url && !seen.has(url)) {
      seen.add(url)
      targets.push({ name: project.title, url })
    }
  }
  return targets
}

export async function checkSystems(targets) {
  const systems = await Promise.all(
    targets.map(async (target) => {
      const started = Date.now()
      try {
        const response = await fetch(target.url, {
          redirect: 'follow',
          signal: AbortSignal.timeout(6000),
        })
        return { ...target, ok: response.ok, status: response.status, ms: Date.now() - started }
      } catch {
        return { ...target, ok: false, status: 0, ms: Date.now() - started }
      }
    })
  )
  return { systems, systemsCheckedAt: new Date().toISOString() }
}

// --- OpenGraph / Twitter card images ----------------------------------------
// Deployed projects advertise a cover image via og:image / twitter:image meta
// tags. We scrape those so project cards show the site's own card image
// without a manual upload. Admin-set images (repoImages) still win client-side.

const OG_IMAGE_KEYS = ['og:image', 'og:image:secure_url', 'twitter:image', 'twitter:image:src']
const OG_TIMEOUT_MS = 5000
const OG_MAX_BYTES = 256 * 1024
// Overall budget under Vercel's ~10s function limit: a pile of dead sites
// must return a partial map, never time the whole endpoint out.
const OG_DEADLINE_MS = 8000

// Pull the highest-priority card image out of an HTML head. Attribute order
// and quote style vary, so each <meta> tag is parsed attribute by attribute.
export function extractOgImage(html) {
  if (!html) return ''
  const tags = html.match(/<meta\s[^>]*>/gi) || []
  const found = {}
  for (const tag of tags) {
    const attrs = {}
    for (const match of tag.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
      attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
    }
    const key = (attrs.property || attrs.name || '').toLowerCase()
    if (OG_IMAGE_KEYS.includes(key) && attrs.content && !found[key]) found[key] = attrs.content.trim()
  }
  for (const key of OG_IMAGE_KEYS) {
    if (found[key]) return found[key]
  }
  return ''
}

// Read only the head's first maxBytes of the body — meta tags live in <head>, and a
// giant page should never be downloaded in full. shortcut: 256KB covers typical
// static heads but can miss meta tags pushed past heavy inline JS/CSS blocks
// (SPA bundles) — upgrade to a streaming parse that stops at </head> if so.
async function readHead(response, maxBytes) {
  const body = response.body
  if (!body || typeof body.getReader !== 'function') return response.text()
  const reader = body.getReader()
  const decoder = new TextDecoder('utf-8')
  let text = ''
  let received = 0
  try {
    while (received < maxBytes) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      text += decoder.decode(value, { stream: true })
      // Meta tags are in <head>; the first </head> marks the end of the
      // region we care about. Infinity-sized SPA heads are cut short here.
      const end = text.search(/<\/head\s*>/i)
      if (end !== -1) { text = text.slice(0, end); break }
    }
  } finally {
    try { await reader.cancel() } catch { /* body already closed */ }
  }
  return text
}

async function fetchOgImage(target, timeoutMs) {
  try {
    const response = await fetch(target.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'text/html,application/xhtml+xml' },
    })
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') || ''
    if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) return null
    const src = extractOgImage(await readHead(response, OG_MAX_BYTES))
    if (!src) return null
    // Relative og:image URLs resolve against the final (post-redirect) address.
    return { url: target.url, image: new URL(src, response.url || target.url).href }
  } catch {
    return null
  }
}

// Scrape every target's card image in parallel. Individual failures resolve
// to null — one dead site never fails the rollup. Returns
// { projectImages: { [targetUrl]: imageUrl }, projectImagesCheckedAt }.
export async function fetchOgImages(targets) {
  const deadline = Date.now() + OG_DEADLINE_MS
  const hits = await Promise.all(
    targets.map(async (target) => {
      const remaining = deadline - Date.now()
      if (remaining <= 250) return null
      return fetchOgImage(target, Math.min(OG_TIMEOUT_MS, remaining))
    })
  )
  const projectImages = {}
  for (const hit of hits) {
    if (hit) projectImages[hit.url] = hit.image
  }
  return { projectImages, projectImagesCheckedAt: new Date().toISOString() }
}

// Full project-image rollup:
//   1. live-site og:image/twitter:image for every deployed project (repo
//      homepages + manual hrefs),
//   2. each GitHub repo's own page — GitHub renders og:image social cards for
//      every repo, which is the only card most repos have. A live site's own
//      image still wins client-side (homepage is looked up before href),
//   3. manual projects' `repo` URL, same GitHub-card fallback.
// Keys are the URLs the client looks projects up by: repo.homepage,
// repo.href, normUrl(manual.href) and normUrl(manual.repo).
export async function fetchProjectImages(data, manualProjects = [], repoLinks = {}) {
  const targets = getSystemTargets(data, manualProjects, repoLinks)
  const seen = new Set(targets.map((target) => target.url))
  for (const repo of [...(data.pinnedRepos || []), ...(data.repos || [])]) {
    if (repo.href && !seen.has(repo.href)) {
      seen.add(repo.href)
      targets.push({ name: repo.title, url: repo.href })
    }
  }
  for (const project of manualProjects) {
    const url = project?.repo && project.repo !== '#' ? normUrl(project.repo) : ''
    if (url && !seen.has(url)) {
      seen.add(url)
      targets.push({ name: project.title, url })
    }
  }
  return fetchOgImages(targets)
}
