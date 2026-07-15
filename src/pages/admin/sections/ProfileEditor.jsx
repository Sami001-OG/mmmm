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
      <h2 className="h3 mb-1">Profile</h2>
      <p className="text-ink-dim text-sm mb-6">Your name, title, bio, and contact info.</p>

      <div className="space-y-4 mb-8">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="admin-label">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                rows={3}
                className="admin-input resize-none"
              />
            ) : (
              <input
                type={f.type}
                value={form[f.key] || ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="admin-input"
              />
            )}
          </div>
        ))}
      </div>

      <details className="mono-data text-ink-dim">
        <summary className="cursor-pointer hover:text-ink transition-colors duration-240">Show config snippet</summary>
        <pre className="mt-2 p-3 bg-sunken border border-line text-[11px] text-ink-dim overflow-x-auto font-mono">{generated}</pre>
      </details>
    </div>
  )
}
