import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import Icon from '../ui/Icon'
import KineticComposition from './KineticComposition'
import { paletteFromLanguages } from '../../data/langColors'

const Hero3D = lazy(() => import('./Hero3D'))

/**
 * Hero band — type-as-architecture. Oversized lowercase display name on the
 * left, the Kinetic Composition poster on the right. Fully server-rendered
 * (no typewriter/scramble JS), so it paints as the LCP element immediately.
 * Poster accent colors are seeded from the user's real top GitHub languages.
 * 3D enhances on the client only: SVG stays as LCP + fallback, WebGL loads
 * idle + in-view, pauses offscreen, honors reduced-motion.
 */
export default function Hero({ profile, languages }) {
  const name = profile.name || 'Sami'
  const bio = profile.bio || 'Developer. Builder. Stoic.'
  const location = profile.location
  const status = profile.status || 'online'
  const login = profile.login
  const palette = useMemo(() => paletteFromLanguages(languages), [languages])
  const posterRef = useRef(null)
  const [load3D, setLoad3D] = useState(false)
  const [ready3D, setReady3D] = useState(false)

  // Load 3D only when hero is visible + browser is idle. SSR/LCP stays SVG.
  useEffect(() => {
    const el = posterRef.current
    if (!el) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    let idleId = 0
    let cancelled = false
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !cancelled) {
          const kick = () => { if (!cancelled) setLoad3D(true) }
          if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(kick, { timeout: 2500 })
          } else {
            window.setTimeout(kick, 900)
          }
          io.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
      if ('cancelIdleCallback' in window && idleId) window.cancelIdleCallback(idleId)
    }
  }, [])

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

        {/* ── Right: 3D artifact (SVG is SSR LCP + fallback only) ────── */}
        <div
          ref={posterRef}
          className="relative w-full max-w-[340px] mx-auto lg:mx-0 aspect-square border-2 border-line-strong bg-paper"
        >
          {!ready3D && <KineticComposition palette={palette} />}
          {load3D && (
            <Suspense fallback={null}>
              <Hero3D palette={palette} onReady={() => setReady3D(true)} />
            </Suspense>
          )}
          {/* Corner registration marks — technical-drawing cue, same as SVG poster */}
          <span aria-hidden className="pointer-events-none absolute left-2 top-2 h-[18px] w-[18px] border-l-2 border-t-2 border-ink opacity-50" />
          <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 h-[18px] w-[18px] border-b-2 border-r-2 border-ink opacity-50" />
        </div>
      </div>
    </section>
  )
}
