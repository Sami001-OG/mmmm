import { langColors, brandPalette } from '../../data/langColors'

const colorFor = (lang, i) => langColors[lang] || brandPalette[i % brandPalette.length]
const ONGOING_MS = 60 * 24 * 60 * 60 * 1000 // pushed within ~2 months = alive

/**
 * Proof-of-work timeline — every project as a bar on a real time axis,
 * first commit → last push. No claims, just the record: eras, overlaps,
 * and gaps stay visible. Flat bars on hairline year gridlines; a live dot
 * marks projects still moving.
 */
export default function Timeline({ items }) {
  // Day-quantized "now" — keeps SSR and hydration output identical (a raw
  // Date.now() differs between prerender time and view time).
  const now = Math.floor(Date.now() / 86400000) * 86400000
  const parsed = (items || [])
    .map((it, i) => {
      const start = new Date(it.start).getTime()
      const end = it.end ? new Date(it.end).getTime() : now
      if (Number.isNaN(start)) return null
      return {
        ...it,
        startMs: start,
        endMs: Number.isNaN(end) ? now : Math.max(end, start),
        color: colorFor(it.lang, i),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.startMs - b.startMs)

  if (parsed.length === 0) return null

  const min = parsed[0].startMs
  const max = Math.max(now, ...parsed.map((p) => p.endMs))
  const span = Math.max(max - min, 1)
  const pct = (t) => ((t - min) / span) * 100

  // Year ticks — only years whose Jan 1 falls inside the span.
  const years = []
  for (let y = new Date(min).getFullYear() + 1; y <= new Date(max).getFullYear(); y++) {
    years.push(y)
  }

  return (
    <div className="card p-5 overflow-x-auto scrollbar-thin">
      <div className="min-w-[520px]">
        {/* Year axis */}
        <div className="flex mb-1">
          <div className="w-36 shrink-0" />
          <div className="flex-1 relative h-5">
            {years.map((y) => (
              <span
                key={y}
                className="absolute -translate-x-1/2 mono-data text-[10px] text-ink-faint"
                style={{ left: `${pct(new Date(y, 0, 1).getTime())}%` }}
              >
                {y}
              </span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="flex">
          <div className="w-36 shrink-0 space-y-2">
            {parsed.map((p) => (
              <div key={p.id} className="h-5 flex items-center pr-3">
                <span className="mono-data text-[11px] text-ink-dim truncate">{p.title}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            {years.map((y) => (
              <span
                key={y}
                aria-hidden
                className="absolute inset-y-0 w-px bg-line/70"
                style={{ left: `${pct(new Date(y, 0, 1).getTime())}%` }}
              />
            ))}
            <div className="space-y-2 relative">
              {parsed.map((p) => {
                const left = pct(p.startMs)
                const width = Math.max(pct(p.endMs) - left, 1.2)
                const ongoing = now - p.endMs < ONGOING_MS
                return (
                  <div key={p.id} className="h-5 relative">
                    <span
                      className="absolute top-1/2 -translate-y-1/2 h-2"
                      style={{ left: `${left}%`, width: `${width}%`, backgroundColor: p.color }}
                      title={`${p.title} — ${new Date(p.startMs).toISOString().slice(0, 10)} → ${ongoing ? 'now' : new Date(p.endMs).toISOString().slice(0, 10)}`}
                    />
                    {ongoing && (
                      <span
                        aria-hidden
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-live"
                        style={{ left: `calc(${Math.min(left + width, 99)}% + 4px)` }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between mono-data text-[10px] text-ink-faint">
          <span>FIRST COMMIT → LAST PUSH · {parsed.length} PROJECTS</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-live" /> ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
