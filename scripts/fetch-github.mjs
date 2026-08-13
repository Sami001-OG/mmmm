import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkSystems, getGithubData, getSystemTargets } from '../lib/github-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../src/data/github-static.json')
const CONTENT = resolve(__dirname, '../src/data/content.json')
const DOTENV = resolve(__dirname, '../.env')

if (existsSync(DOTENV)) {
  for (const line of readFileSync(DOTENV, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function readJson(path, fallback) {
  try { return JSON.parse(readFileSync(path, 'utf-8')) } catch { return fallback }
}

async function main() {
  const previous = readJson(OUTPUT, {})
  const username = process.env.GITHUB_USERNAME || 'Sami001-OG'
  const token = process.env.GITHUB_TOKEN
  if (!token) console.warn('! No GITHUB_TOKEN: contribution and pinned data will use the previous snapshot.')

  try {
    const data = await getGithubData({ username, token, previous })
    const content = readJson(CONTENT, {})
    const status = await checkSystems(getSystemTargets(data, content.projects || []))
    const result = { ...data, ...status }
    writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`)
    console.log(`Synced ${result.login}: ${result.repos.length} repos, ${result.totalStars} stars, ${result.systems.length} systems`)
  } catch (error) {
    if (previous && !previous._empty) {
      console.warn(`GitHub sync failed: ${error.message}. Keeping the previous snapshot.`)
      return
    }
    writeFileSync(OUTPUT, '{"_empty":true}\n')
    throw error
  }
}

main().catch((error) => {
  console.error(`GitHub sync failed: ${error.message}`)
  process.exitCode = 1
})
