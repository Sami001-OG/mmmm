import { useMemo } from 'react'
import Icon from '../ui/Icon'
import KineticComposition from './KineticComposition'
import { paletteFromLanguages } from '../../data/langColors'

/**
 * Hero band — type-as-architecture. Oversized lowercase display name on the
 * left, the Kinetic Composition poster on the right. Fully server-rendered
 * (no typewriter/scramble JS), so it paints as the LCP element immediately.
 * Poster accent colors are seeded from the user's real top GitHub languages.
 */
export default function Hero({ profile, languages }) {
  const name = profile.name || 'Sami'
  const bio = profile.bio || 'Developer. Builder. Stoic.'
  const location = profile.location
  const status = profile.status || 'online'
  const login = profile.login
  const palette = useMemo(() => paletteFromLanguages(languages), [languages])

  return (
    <section className="relative pt-2 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-10">
        {/* ── Left: type block ─────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* Eyebrow — live status + location, mono */}
          <div className="flex items-center gap-3 mb-5">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-live" />
              <span className="mono-label text-live normal-case tracking-normal">{status}</span>
            </span>
            {location && (
              <>
                <span className="w-1.5 h-1.5 bg-line-strong" aria-hidden />
                <span className="mono-label">{location}</span>
              </>
            )}
          </div>

          {/* Oversized display name */}
          <h1 className="display-xl text-balance">{name}</h1>

          {/* Accent rule under the name */}
          <div className="mt-4 h-1 w-40 bg-yellow" aria-hidden />

          {/* Bio */}
          <p className="mt-6 max-w-xl text-ink-dim text-[15px] leading-relaxed">{bio}</p>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-3 mt-7">
            {login && (
              <a
                href={`https://github.com/${login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-yellow"
              >
                <Icon name="github" size={13} />
                <span>@{login}</span>
              </a>
            )}
            <a href="#projects" className="btn-ghost">
              <span>View work</span>
              <span className="shape-tri" aria-hidden />
            </a>
          </div>
        </div>

        {/* ── Right: Kinetic Composition poster ────────────────────────── */}
        <div className="w-full max-w-[340px] mx-auto lg:mx-0 aspect-square">
          <KineticComposition palette={palette} />
        </div>
      </div>
    </section>
  )
}
