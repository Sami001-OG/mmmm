import Icon from '../ui/Icon'

export default function StatCard({ label, value, icon, trend }) {
  const trendIsUp = trend && trend.startsWith('+')

  return (
    <div className="card-hover group p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="stat-label">{label}</span>
        <div className="p-2 rounded-xl bg-surface-700/40 text-surface-400 group-hover:text-accent-400 transition-colors">
          <Icon name={icon} size={16} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="stat-value">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium pb-0.5 ${
              trendIsUp ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  )
}
