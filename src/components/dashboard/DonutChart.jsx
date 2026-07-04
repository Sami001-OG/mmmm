const COLORS = ['#22d3ee', '#8b5cf6', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#a78bfa', '#fb923c']

export default function DonutChart({ data, size = 180 }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.35
  const strokeWidth = size * 0.12
  const total = data.reduce((s, d) => s + d.percentage, 0) || 100
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const segments = data.map((d, i) => {
    const length = (d.percentage / total) * circumference
    const seg = {
      name: d.name,
      percentage: d.percentage,
      color: COLORS[i % COLORS.length],
      dash: `${length} ${circumference - length}`,
      offset: -offset,
    }
    offset += length
    return seg
  })

  return (
    <div className="card p-5 flex items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(51,65,85,0.3)" strokeWidth={strokeWidth} />
          {segments.map((seg) => (
            <circle
              key={seg.name}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dash}
              strokeDashoffset={seg.offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              className="transition-all duration-700"
            />
          ))}
          <circle cx={cx} cy={cy} r={radius - strokeWidth * 0.75} fill="#0f172a" />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9" fontSize={size * 0.1} fontWeight={700}>
            {data.length}
          </text>
          <text x={cx} y={cy + size * 0.08} textAnchor="middle" fill="#64748b" fontSize={size * 0.065}>
            Languages
          </text>
        </svg>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-surface-300 flex-1 truncate">{d.name}</span>
            <span className="text-xs font-mono text-surface-500 tabular-nums">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
