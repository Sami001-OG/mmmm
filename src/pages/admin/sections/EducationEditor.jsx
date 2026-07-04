import { useState } from 'react'

const empty = { school: '', degree: '', field: '', year: '', notes: '' }

export default function EducationEditor() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_draft_education')
      return saved ? JSON.parse(saved) : [{ ...empty }]
    } catch { return [{ ...empty }] }
  })

  const update = (idx, key, val) => {
    const next = [...items]
    next[idx] = { ...next[idx], [key]: val }
    setItems(next)
    localStorage.setItem('portfolio_draft_education', JSON.stringify(next))
  }

  const add = () => {
    setItems([...items, { ...empty }])
    localStorage.setItem('portfolio_draft_education', JSON.stringify([...items, { ...empty }]))
  }

  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx)
    setItems(next)
    localStorage.setItem('portfolio_draft_education', JSON.stringify(next))
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-100 mb-1">Education</h2>
      <p className="text-xs text-surface-400 mb-6">Your school, college, or university.</p>

      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-surface-300">#{idx + 1}</span>
              {items.length > 1 && <button onClick={() => remove(idx)} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Remove</button>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-surface-400 mb-1 block">School / University</label>
                <input value={item.school} onChange={(e) => update(idx, 'school', e.target.value)} className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
              </div>
              <div>
                <label className="text-[11px] text-surface-400 mb-1 block">Degree</label>
                <input value={item.degree} onChange={(e) => update(idx, 'degree', e.target.value)} placeholder="BSc, HSC, etc." className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-surface-400 mb-1 block">Field of Study</label>
                <input value={item.field} onChange={(e) => update(idx, 'field', e.target.value)} placeholder="Computer Science" className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
              </div>
              <div>
                <label className="text-[11px] text-surface-400 mb-1 block">Year</label>
                <input value={item.year} onChange={(e) => update(idx, 'year', e.target.value)} placeholder="2024 — 2028" className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-surface-400 mb-1 block">Notes (optional)</label>
              <input value={item.notes} onChange={(e) => update(idx, 'notes', e.target.value)} placeholder="Notable achievements, clubs, etc." className="w-full px-3 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} className="px-4 py-2 rounded-xl bg-surface-700/40 border border-surface-600/20 text-xs text-surface-300 hover:bg-surface-700/60 transition-all">
        + Add Education
      </button>
    </div>
  )
}
