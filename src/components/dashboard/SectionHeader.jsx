export default function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="text-xs text-surface-400 mt-1.5">{description}</p>}
      </div>
      {action && (
        <button className="text-xs font-medium text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1">
          {action}
        </button>
      )}
    </div>
  )
}
