// GitHub contribution heatmap — flat square cells, cascade reveal on mount.
// Intensity maps onto the live-green (data) with stepped opacity; the "today"
// cell carries a yellow outline. No glow, ring-pulse, or scanline.

const levelBg = [
  'bg-surface-hi',
  'bg-live/25',
  'bg-live/45',
  'bg-live/70',
  'bg-live',
]

export default function ContributionGraph({ data }) {
  const total = data.totalContributions.toLocaleString()
  const weeks = data.weeks
  const lastWeek = weeks.length - 1
  let lastDay = 6
  for (let i = 6; i >= 0; i--) {
    if (weeks[lastWeek]?.[i]) { lastDay = i; break }
  }
  const maxStagger = Math.min(weeks.length, 28)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="h3">Contribution Activity</h3>
          <p className="mono-data text-ink-dim mt-1">
            <span className="text-live tabular-nums">{total}</span> contributions in the last year
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-2 mono-label text-live normal-case tracking-normal">
          <span className="w-2 h-2 rounded-full bg-live" />
          Live
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1 pb-1">
        <div className="flex gap-[3px] min-w-fit">
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="flex flex-col gap-[3px]"
              style={{ animation: 'fadeIn 0.5s var(--ease-brake) both', animationDelay: `${Math.min(wi, maxStagger) * 16}ms`, opacity: 0 }}
            >
              {week.map((day, di) => {
                const isToday = wi === lastWeek && di === lastDay
                return (
                  <div
                    key={di}
                    className={`w-3 h-3 ${levelBg[day.level]} ${isToday ? 'outline outline-1 outline-yellow' : ''}`}
                    title={`${day.date}: ${day.count ?? day.level} contributions`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 mono-label normal-case tracking-normal">
        <span>Less</span>
        <div className="flex items-center gap-[3px]">
          {levelBg.map((bg, i) => (
            <span key={i} className={`w-2.5 h-2.5 ${bg}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
