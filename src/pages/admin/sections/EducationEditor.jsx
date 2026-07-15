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
      <h2 className="h3 mb-1">Education</h2>
      <p className="text-ink-dim text-sm mb-6">Your school, college, or university.</p>

      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="admin-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="mono-label">Entry {String(idx + 1).padStart(2, '0')}</span>
              {items.length > 1 && <button onClick={() => remove(idx)} className="admin-remove">Remove</button>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">School / University</label>
                <input value={item.school} onChange={(e) => update(idx, 'school', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Degree</label>
                <input value={item.degree} onChange={(e) => update(idx, 'degree', e.target.value)} placeholder="BSc, HSC, etc." className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Field of Study</label>
                <input value={item.field} onChange={(e) => update(idx, 'field', e.target.value)} placeholder="Computer Science" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Year</label>
                <input value={item.year} onChange={(e) => update(idx, 'year', e.target.value)} placeholder="2024 — 2028" className="admin-input" />
              </div>
            </div>
            <div>
              <label className="admin-label">Notes (optional)</label>
              <input value={item.notes} onChange={(e) => update(idx, 'notes', e.target.value)} placeholder="Notable achievements, clubs, etc." className="admin-input" />
            </div>
          </div>
        ))}
      </div>

      <button onClick={add} className="admin-btn">+ Add Education</button>
    </div>
  )
}
