import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getGithubData } from '../lib/github-data.js'

const SNAPSHOT = fileURLToPath(new URL('../src/data/github-static.json', import.meta.url))

function readSnapshot() {
  try {
    const data = JSON.parse(readFileSync(SNAPSHOT, 'utf-8'))
    return data && !data._empty ? data : {}
  } catch {
    return {}
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const previous = readSnapshot()
  const username = process.env.GITHUB_USERNAME || previous.login || 'Sami001-OG'
  try {
    const data = await getGithubData({
      username,
      token: process.env.GITHUB_TOKEN,
      previous,
    })
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400')
    res.status(200).json(data)
  } catch (error) {
    if (previous.login) {
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600')
      res.status(200).json({ ...previous, source: 'snapshot', refreshError: error.message })
      return
    }
    res.status(502).json({ error: error.message || 'GitHub data is unavailable' })
  }
}
