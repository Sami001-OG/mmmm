// Canonical GitHub-language → brand color map. Single source of truth shared
// by ProjectCard tag dots and the language chart so the palette never drifts
// between components. Colors follow GitHub's linguist where sensible.
export const langColors = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  HTML: '#e34f26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Solidity: '#363636',
  Ruby: '#701516',
  PHP: '#4f5d95',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  Scala: '#c22d40',
  'Jupyter Notebook': '#da5b0b',
}

// Fallback palette when a language has no known color — Dessau primaries.
export const brandPalette = ['#4C8DFF', '#E5484D', '#F5C518', '#7AA7FF']

/**
 * Given the GitHub `languages` array (`[{ name, percentage }]`), return an
 * ordered list of hex colors for the top `max` languages, backfilled with the
 * brand palette so there's always at least a couple of colors to draw.
 */
export function paletteFromLanguages(languages, max = 5) {
  if (!Array.isArray(languages) || !languages.length) return brandPalette
  const colors = languages
    .slice(0, max)
    .map((l) => langColors[l.name])
    .filter(Boolean)
  return colors.length >= 2 ? colors : brandPalette
}
