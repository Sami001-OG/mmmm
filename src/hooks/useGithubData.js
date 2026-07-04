import staticData from '../data/github-static.json'

export default function useGithubData(username) {
  if (!username) {
    return { data: null, error: 'No GitHub username configured' }
  }
  if (staticData && !staticData._empty) {
    return { data: staticData, error: null }
  }
  return { data: null, error: 'No cached data. Run npm run fetch-github first.' }
}
