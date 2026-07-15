// Vercel serverless function — publishes admin-panel content to the repo.
//
// POST { password, content } → validates the admin password server-side, then
// commits src/data/content.json to CONTENT_REPO via the GitHub Contents API.
// The push triggers Vercel's git integration, which rebuilds and redeploys the
// site with the new content baked in (~1 minute).
//
// Required env vars (set in Vercel → Settings → Environment Variables):
//   GITHUB_TOKEN    — token with `contents: write` on the repo (already needed
//                     at build time for fetch-github.mjs)
//   CONTENT_REPO    — "owner/repo" of this site's repository
//   ADMIN_PASSWORD  — server-side admin password (falls back to
//                     VITE_ADMIN_PASSWORD, which the login screen uses)

const ALLOWED_KEYS = ['profile', 'social', 'experience', 'education', 'skills', 'projects', 'repoImages']
const FILE_PATH = 'src/data/content.json'
const API = 'https://api.github.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const adminPw = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD
  if (!adminPw) {
    res.status(500).json({ error: 'ADMIN_PASSWORD is not configured on the server.' })
    return
  }

  const { password, content } = req.body || {}
  if (!password || password !== adminPw) {
    res.status(401).json({ error: 'Invalid password.' })
    return
  }

  const token = process.env.GITHUB_TOKEN
  // Accept "owner/repo", a full github.com URL, or a .git clone URL.
  const repo = (process.env.CONTENT_REPO || '')
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '')
  if (!token || !repo) {
    res.status(500).json({ error: 'GITHUB_TOKEN / CONTENT_REPO not configured on the server.' })
    return
  }

  // Only accept known content sections — never write arbitrary payloads.
  if (!content || typeof content !== 'object') {
    res.status(400).json({ error: 'Missing content payload.' })
    return
  }
  const clean = {}
  for (const key of ALLOWED_KEYS) {
    if (key in content) clean[key] = content[key]
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }

  try {
    // 1. Current file sha (required by the Contents API to update in place).
    const getRes = await fetch(`${API}/repos/${repo}/contents/${FILE_PATH}?ref=main`, { headers })
    let sha
    let existing = {}
    if (getRes.ok) {
      const file = await getRes.json()
      sha = file.sha
      try {
        existing = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'))
      } catch { /* corrupt file — overwrite wholesale */ }
    } else if (getRes.status !== 404) {
      throw new Error(`GitHub read failed (${getRes.status})`)
    }

    // 2. Merge: sections the panel didn't touch keep their committed values.
    const merged = { ...existing, ...clean }
    const body = {
      message: 'Update portfolio content via admin panel',
      content: Buffer.from(JSON.stringify(merged, null, 2) + '\n').toString('base64'),
      branch: 'main',
      ...(sha ? { sha } : {}),
    }

    const putRes = await fetch(`${API}/repos/${repo}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    if (!putRes.ok) {
      const detail = await putRes.json().catch(() => ({}))
      if (putRes.status === 404) {
        throw new Error(
          `GitHub can't find "${repo}" — check CONTENT_REPO is "owner/repo" and the token has Contents read/write access to it.`
        )
      }
      throw new Error(detail.message || `GitHub write failed (${putRes.status})`)
    }

    const result = await putRes.json()
    res.status(200).json({
      ok: true,
      commit: result.commit?.sha?.slice(0, 7) || null,
      message: 'Published. Vercel is redeploying — changes go live in about a minute.',
    })
  } catch (err) {
    res.status(502).json({ error: err.message || 'Publish failed.' })
  }
}
