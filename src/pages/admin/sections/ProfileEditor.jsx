import { useState } from 'react'
import { profile } from '../../../data/portfolio'

const fields = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone', type: 'tel' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'text' },
]

export default function ProfileEditor() {
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_draft_profile')
      return saved ? JSON.parse(saved) : { ...profile }
    } catch { return { ...profile } }
  })

  const handleChange = (key, value) => {
    const next = { ...form, [key]: value }
    setForm(next)
    localStorage.setItem('portfolio_draft_profile', JSON.stringify(next))
  }

  const generated = `  profile: ${JSON.stringify(form, null, 4).replace(/"/g, "'").replace(/^/gm, '    ').trimStart()}`

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-100 mb-1">Profile</h2>
      <p className="text-xs text-surface-400 mb-6">Your name, title, bio, and contact info.</p>

      <div className="space-y-4 mb-8">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-accent-400/30 transition-all resize-none"
              />
            ) : (
              <input
                type={f.type}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-accent-400/30 transition-all"
              />
            )}
          </div>
        ))}
      </div>

      <details className="text-xs text-surface-400">
        <summary className="cursor-pointer hover:text-surface-200 transition-colors">Show config snippet</summary>
        <pre className="mt-2 p-3 rounded-xl bg-surface-800/50 border border-surface-600/20 text-[11px] text-surface-400 overflow-x-auto font-mono">{generated}</pre>
      </details>
    </div>
  )
}
