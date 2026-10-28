import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { fetchOgImages, getSystemTargets } from '../lib/github-data.js'

const SNAPSHOT = fileURLToPath(new URL('../src/data/github-static.json', import.meta.url))
const CONTENT = fileURLToPath(new URL('../src/data/content.json', import.meta.url))

function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf-8')) } catch { return fallback }
}

// GET /api/og → { projectImages: { [liveUrl]: imageUrl }, projectImagesCheckedAt }
// projectImages maps each project's live URL (repo homepage / manual href) to
// the og:image / twitter:image scraped from that page. Client-side, admin-set
// images (repoImages, manual image) still take priority over these.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const snapshot = readJson(SNAPSHOT, {})
  const content = readJson(CONTENT, {})
  try {
    const result = await fetchOgImages(getSystemTargets(snapshot, content.projects || []))
    // Card images change rarely — cache hard and revalidate in the background.
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400')
    res.status(200).json(result)
  } catch (error) {
    if (snapshot.projectImages) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600')
      res.status(200).json({
        projectImages: snapshot.projectImages,
        projectImagesCheckedAt: snapshot.projectImagesCheckedAt || snapshot.fetchedAt,
        source: 'snapshot',
        refreshError: error.message,
      })
      return
    }
    res.status(502).json({ error: error.message || 'Project images are unavailable' })
  }
}
