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
      <h2 className="text-base font-semibold text-surface-100 mb-1">Skills</h2>
      <p className="text-xs text-surface-400 mb-6">Skill categories with proficiency levels. The Languages card is auto-calculated from GitHub code bytes.</p>

      <div className="space-y-4 mb-6">
        {categories.map((cat, ci) => (
          <div key={ci} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <input value={cat.name} onChange={(e) => updateCat(ci, e.target.value)} placeholder="Category name (e.g. Frontend)" className="text-sm font-semibold text-surface-100 bg-transparent border-b border-transparent focus:border-accent-400/30 outline-none pb-0.5" />
              <button onClick={() => removeCategory(ci)} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">Remove</button>
            </div>
            {cat.skills.map((sk, si) => (
              <div key={si} className="flex items-center gap-3">
                <input value={sk.name} onChange={(e) => updateSkill(ci, si, 'name', e.target.value)} placeholder="Skill name" className="flex-1 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-600/30 text-sm text-surface-200 outline-none focus:border-accent-400/30 transition-all" />
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sk.level}
                    onChange={(e) => updateSkill(ci, si, 'level', e.target.value)}
                    className="w-20 accent-accent-400"
                  />
                  <span className="text-xs font-mono text-surface-400 w-8 text-right">{sk.level}%</span>
                </div>
                <button onClick={() => removeSkill(ci, si)} className="text-surface-500 hover:text-red-400 transition-colors text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => addSkill(ci)} className="text-[11px] text-accent-400 hover:text-accent-300 transition-colors">+ Add skill</button>
          </div>
        ))}
      </div>

      <button onClick={addCategory} className="px-4 py-2 rounded-xl bg-surface-700/40 border border-surface-600/20 text-xs text-surface-300 hover:bg-surface-700/60 transition-all">
        + Add Category
      </button>
    </div>
  )
}
