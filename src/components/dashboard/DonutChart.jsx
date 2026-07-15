import { useState } from 'react'
import useInView from '../../hooks/useInView'
import useCountUp from '../../hooks/useCountUp'
import { langColors, brandPalette } from '../../data/langColors'

const colorFor = (name, i) => langColors[name] || brandPalette[i % brandPalette.length]

/**
 * Language donut — flat ring segments in each language's canonical color.
 * Sharp-capped strokes animate in from zero on view; hovering a legend row
 * emphasizes its segment. No conic glow, no rotating rings, no drop-shadows.
 */
export default function DonutChart({ data, size = 176 }) {
  const [ref, inView] = useInView({ once: true, threshold: 0.25 })
  const [hovered, setHovered] = useState(null)
  const count = useCountUp(data.length, { active: inView, duration: 1000 })

  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  const strokeWidth = size * 0.1
  const total = data.reduce((s, d) => s + d.percentage, 0) || 100
  const circ = 2 * Math.PI * radius

  let acc = 0
  const segments = data.map((d, i) => {
    const len = (d.percentage / total) * circ
    const seg = { name: d.name, color: colorFor(d.name, i), len, offset: -acc, index: i }
    acc += len
    return seg
  })

  return (
    <div ref={ref} className="card p-5 flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#232228" strokeWidth={strokeWidth} />
        {segments.map((seg, idx) => {
          const dim = hovered !== null && hovered !== seg.index
          return (
            <circle
              key={seg.name}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={inView ? `${seg.len} ${circ - seg.len}` : `0 ${circ}`}
              strokeDashoffset={seg.offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{
                opacity: dim ? 0.3 : 1,
                transition: `stroke-dasharray 900ms var(--ease-machine) ${idx * 90}ms, opacity 200ms linear`,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(seg.index)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#F2F0EB" fontSize={size * 0.16} fontWeight="800" className="font-display tabular-nums">
          {count}
        </text>
        <text x={cx} y={cy + size * 0.11} textAnchor="middle" fill="#6E6B73" fontSize={size * 0.052} letterSpacing="0.14em" className="font-mono">
          LANGUAGES
        </text>
      </svg>

      <div className="flex-1 min-w-0 space-y-1">
        {data.map((d, i) => (
          <button
            key={d.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`w-full flex items-center gap-2.5 px-1.5 py-1 transition-colors duration-240 ${hovered === i ? 'bg-surface-hi' : ''}`}
          >
            <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: colorFor(d.name, i) }} />
            <span className="text-ink text-sm flex-1 truncate text-left">{d.name}</span>
            <span className="mono-data text-ink-faint tabular-nums">{d.percentage}%</span>
          </button>
        ))}
      </div>
    </div>
  )
}
