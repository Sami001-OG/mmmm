import { useState } from 'react'

const emptyCat = { name: '', skills: [{ name: '', level: 50 }] }

export default function SkillsEditor() {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_draft_skills')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const updateCat = (idx, val) => {
    const next = [...categories]
    next[idx] = { ...next[idx], name: val }
    setCategories(next)
    localStorage.setItem('portfolio_draft_skills', JSON.stringify(next))
  }

  const updateSkill = (catIdx, skIdx, key, val) => {
    const next = [...categories]
    next[catIdx].skills[skIdx] = { ...next[catIdx].skills[skIdx], [key]: key === 'level' ? Number(val) : val }
    setCategories(next)
    localStorage.setItem('portfolio_draft_skills', JSON.stringify(next))
  }

  const addSkill = (catIdx) => {
    const next = [...categories]
    next[catIdx].skills.push({ name: '', level: 50 })
    setCategories(next)
    localStorage.setItem('portfolio_draft_skills', JSON.stringify(next))
  }

  const removeSkill = (catIdx, skIdx) => {
    const next = [...categories]
    next[catIdx].skills = next[catIdx].skills.filter((_, i) => i !== skIdx)
    setCategories(next)
    localStorage.setItem('portfolio_draft_skills', JSON.stringify(next))
  }

  const addCategory = () => {
    setCategories([...categories, { ...emptyCat }])
    localStorage.setItem('portfolio_draft_skills', JSON.stringify([...categories, { ...emptyCat }]))
  }

  const removeCategory = (idx) => {
    const next = categories.filter((_, i) => i !== idx)
    setCategories(next)
    localStorage.setItem('portfolio_draft_skills', JSON.stringify(next))
  }

  return (
    <div>
      <h2 className="h3 mb-1">Skills</h2>
      <p className="text-ink-dim text-sm mb-6">Skill categories with proficiency levels. The Languages card is auto-calculated from GitHub code bytes.</p>

      <div className="space-y-4 mb-6">
        {categories.map((cat, ci) => (
          <div key={ci} className="admin-card space-y-3">
            <div className="flex items-center justify-between">
              <input value={cat.name} onChange={(e) => updateCat(ci, e.target.value)} placeholder="Category name (e.g. Frontend)" className="text-sm font-semibold text-ink bg-transparent border-b border-line focus:border-line-strong outline-none pb-0.5 transition-colors duration-240" />
              <button onClick={() => removeCategory(ci)} className="admin-remove">Remove</button>
            </div>
            {cat.skills.map((sk, si) => (
              <div key={si} className="flex items-center gap-3">
                <input value={sk.name} onChange={(e) => updateSkill(ci, si, 'name', e.target.value)} placeholder="Skill name" className="admin-input flex-1" />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sk.level}
                    onChange={(e) => updateSkill(ci, si, 'level', e.target.value)}
                    className="w-20 accent-yellow"
                  />
                  <span className="mono-data text-ink-dim w-10 text-right tabular-nums">{sk.level}%</span>
                </div>
                <button onClick={() => removeSkill(ci, si)} className="text-ink-faint hover:text-red-bright transition-colors duration-240 text-sm">✕</button>
              </div>
            ))}
            <button onClick={() => addSkill(ci)} className="admin-remove text-blue-bright hover:text-blue">+ Add skill</button>
          </div>
        ))}
      </div>

      <button onClick={addCategory} className="admin-btn">+ Add Category</button>
    </div>
  )
}
