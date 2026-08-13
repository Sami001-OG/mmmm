import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { checkSystems, getSystemTargets } from '../lib/github-data.js'

const SNAPSHOT = fileURLToPath(new URL('../src/data/github-static.json', import.meta.url))
const CONTENT = fileURLToPath(new URL('../src/data/content.json', import.meta.url))

function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf-8')) } catch { return fallback }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const snapshot = readJson(SNAPSHOT, {})
  const content = readJson(CONTENT, {})
  try {
    const result = await checkSystems(getSystemTargets(snapshot, content.projects || []))
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600')
    res.status(200).json(result)
  } catch (error) {
    if (snapshot.systems?.length) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600')
      res.status(200).json({
        systems: snapshot.systems,
        systemsCheckedAt: snapshot.systemsCheckedAt || snapshot.fetchedAt,
        source: 'snapshot',
        refreshError: error.message,
      })
      return
    }
    res.status(502).json({ error: error.message || 'System status is unavailable' })
  }
}
