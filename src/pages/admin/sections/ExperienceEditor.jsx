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
      <h2 className="h3 mb-1">Experience</h2>
      <p className="text-ink-dim text-sm mb-6">Your work history, internships, and freelance roles.</p>

      {items.length === 0 && (
        <p className="mono-label mb-4">No entries yet. Add your first experience.</p>
      )}

      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="admin-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="mono-label">Entry {String(idx + 1).padStart(2, '0')}</span>
              <button onClick={() => remove(idx)} className="admin-remove">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Company</label>
                <input value={item.company} onChange={(e) => update(idx, 'company', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Role</label>
                <input value={item.role} onChange={(e) => update(idx, 'role', e.target.value)} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="admin-label">Period</label>
              <input value={item.period} onChange={(e) => update(idx, 'period', e.target.value)} placeholder="e.g. Jan 2023 — Present" className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Description</label>
              <textarea value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={2} className="admin-input resize-none" />
            </div>
            <div>
              <label className="admin-label">Highlights</label>
              {item.highlights.map((h, hi) => (
                <div key={hi} className="flex gap-2 mb-1.5">
                  <input value={h} onChange={(e) => updateHighlight(idx, hi, e.target.value)} placeholder="Highlight..." className="admin-input" />
                </div>
              ))}
              <button onClick={() => addHighlight(idx)} className="admin-remove text-blue-bright hover:text-blue">+ Add highlight</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} className="admin-btn">+ Add Experience</button>
    </div>
  )
}
