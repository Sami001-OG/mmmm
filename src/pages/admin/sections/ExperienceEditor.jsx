import { useState } from 'react'

const emptyEntry = { company: '', role: '', period: '', description: '', highlights: [''] }

export default function ExperienceEditor() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_draft_experience')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const update = (idx, key, val) => {
    const next = [...items]
    next[idx] = { ...next[idx], [key]: val }
    setItems(next)
    localStorage.setItem('portfolio_draft_experience', JSON.stringify(next))
  }

  const updateHighlight = (idx, hIdx, val) => {
    const next = [...items]
    next[idx].highlights[hIdx] = val
    setItems(next)
    localStorage.setItem('portfolio_draft_experience', JSON.stringify(next))
  }

  const addHighlight = (idx) => {
    const next = [...items]
    next[idx].highlights.push('')
    setItems(next)
  }

  const add = () => { setItems([...items, { ...emptyEntry }]) }
  const remove = (idx) => { setItems(items.filter((_, i) => i !== idx)) }

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-100 mb-1">Experience</h2>
      <p className="text-xs text-surface-400 mb-6">Your work history, internships, and freelance roles.</p>

      {items.length === 0 && (
        <div className="text-xs text-surface-500 mb-4">No entries yet. Add your first experience.</div>
      )}

      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-surface-300">#{idx + 1}</span>
              <button onClick={() => remove(idx)} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-surface-400 mb-1 block">Company</label>
                <input value={item.company} onChange={(e) => update(idx, 'company', e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
              </div>
              <div>
                <label className="text-[11px] text-surface-400 mb-1 block">Role</label>
                <input value={item.role} onChange={(e) => update(idx, 'role', e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-surface-400 mb-1 block">Period</label>
              <input value={item.period} onChange={(e) => update(idx, 'period', e.target.value)} placeholder="e.g. Jan 2023 — Present" className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
            </div>
            <div>
              <label className="text-[11px] text-surface-400 mb-1 block">Description</label>
              <textarea value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-surface-400 mb-1 block">Highlights</label>
              {item.highlights.map((h, hi) => (
                <div key={hi} className="flex gap-2 mb-1.5">
                  <input value={h} onChange={(e) => updateHighlight(idx, hi, e.target.value)} placeholder="Highlight..." className="flex-1 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
                </div>
              ))}
              <button onClick={() => addHighlight(idx)} className="text-[11px] text-accent-400 hover:text-accent-300 transition-colors">+ Add highlight</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} className="px-4 py-2 rounded-xl bg-surface-700/40 border border-surface-600/20 text-xs text-surface-300 hover:bg-surface-700/60 transition-all">
        + Add Experience
      </button>
    </div>
  )
}
