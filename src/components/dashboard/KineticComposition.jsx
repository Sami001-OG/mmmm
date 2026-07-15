import { useMemo } from 'react'

/**
 * Kinetic Composition — the hero centerpiece and the site's signature image.
 *
 * Pure inline SVG so it renders in SSR HTML (LCP-safe, no JS needed to paint).
 * Bauhaus grammar: the three primaries (blue circle / red square / yellow
 * triangle), an asymmetric grid, and a single diagonal. Idle motion is CSS-only
 * and disabled under reduced-motion via the global gate in index.css.
 *
 * Colors are seeded from the user's real top GitHub languages so the poster is
 * personal, not decorative — falls back to the Dessau primaries.
 */
export default function KineticComposition({ palette = [], className = '' }) {
  const [c1, c2, c3] = useMemo(() => {
    const base = ['#4C8DFF', '#E5484D', '#F5C518']
    const p = Array.isArray(palette) ? palette.filter(Boolean) : []
    return [p[0] || base[0], p[1] || base[1], p[2] || base[2]]
  }, [palette])

  return (
    <svg
      viewBox="0 0 400 400"
      className={`w-full h-full ${className}`}
      role="img"
      aria-label="Abstract Bauhaus composition of a circle, square and triangle"
    >
      <defs>
        <clipPath id="kc-frame">
          <rect x="0" y="0" width="400" height="400" />
        </clipPath>
      </defs>

      <g clipPath="url(#kc-frame)">
        {/* Exposed construction grid */}
        <g stroke="#2A2930" strokeWidth="1">
          <line x1="0" y1="100" x2="400" y2="100" />
          <line x1="0" y1="200" x2="400" y2="200" />
          <line x1="0" y1="300" x2="400" y2="300" />
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
        </g>

        {/* The single diagonal — Kandinsky tension line */}
        <line x1="40" y1="360" x2="360" y2="60" stroke="#3B3A41" strokeWidth="2" />

        {/* Yellow triangle — action, drifts slowly */}
        <polygon
          points="200,70 300,250 100,250"
          fill={c3}
          className="kc-drift kc-drift-a"
          style={{ transformOrigin: '200px 190px' }}
        />

        {/* Red square — work, rotated, counter-drift */}
        <rect
          x="230"
          y="60"
          width="110"
          height="110"
          fill={c2}
          className="kc-drift kc-drift-b"
          style={{ transformOrigin: '285px 115px' }}
        />

        {/* Blue circle — data, the focal mass */}
        <circle cx="150" cy="270" r="78" fill={c1} className="kc-drift kc-drift-c" />

        {/* Small accent ring — outline circle for depth */}
        <circle cx="300" cy="300" r="34" fill="none" stroke="#F2F0EB" strokeWidth="2" opacity="0.85" />

        {/* Corner registration marks (technical drawing cue) */}
        <g stroke="#F2F0EB" strokeWidth="2" opacity="0.5">
          <path d="M16,16 h18 M16,16 v18" fill="none" />
          <path d="M384,384 h-18 M384,384 v-18" fill="none" />
        </g>
      </g>

      {/* Outer frame */}
      <rect x="1" y="1" width="398" height="398" fill="none" stroke="#3B3A41" strokeWidth="2" />
    </svg>
  )
}
