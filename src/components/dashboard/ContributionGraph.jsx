// Simple GitHub-style contribution activity heatmap

const levelColors = [
  'bg-surface-700/30',
  'bg-emerald-400/20',
  'bg-emerald-400/35',
  'bg-emerald-400/55',
  'bg-emerald-400/80',
]

export default function ContributionGraph({ data }) {
  const monthLabels = getMonthLabels(data.weeks)

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-surface-100">Contribution Activity</h3>
          <p className="text-xs text-surface-400 mt-0.5">
            <span className="text-emerald-400 font-medium">{data.totalContributions.toLocaleString()}</span> contributions in the last year
          </p>
        </div>
      </div>

      {/* Graph */}
      <div className="overflow-x-auto scrollbar-thin -mx-1 pb-1">
        <div className="flex gap-[3px] min-w-fit">
          {data.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${levelColors[day.level]} transition-colors hover:ring-1 hover:ring-surface-300/20 cursor-default`}
                  title={`${day.date}: ${day.count ?? day.level} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend + months */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-[10px] text-surface-500 font-medium">Less</div>
        <div className="flex items-center gap-[3px]">
          {levelColors.map((color, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-sm ${color}`} />
          ))}
        </div>
        <div className="text-[10px] text-surface-500 font-medium">More</div>
      </div>
    </div>
  )
}

function getMonthLabels(weeks) {
  const labels = []
  let lastMonth = ''
  weeks.forEach((week, i) => {
    const middleDay = week[3]
    if (middleDay) {
      const date = new Date(middleDay.date + 'T12:00:00')
      const month = date.toLocaleString('en-US', { month: 'short' })
      if (month !== lastMonth) {
        labels.push({ label: month, index: i })
        lastMonth = month
      }
    }
  })
  return labels
}
