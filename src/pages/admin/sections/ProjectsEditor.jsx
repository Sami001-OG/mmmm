import { useState, useRef } from 'react'

const DRAFT_KEY = 'portfolio_draft_projects'
const MAX_IMAGE_BYTES = 600 * 1024 // ~600KB base64 cap keeps localStorage sane

const emptyProject = {
  title: '',
  description: '',
  tags: '',
  href: '',
  image: '',
  stars: 0,
  forks: 0,
  status: 'Live',
  statusColor: 'live',
  featured: false,
}

function load() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export default function ProjectsEditor() {
  const [items, setItems] = useState(load)
  const [error, setError] = useState('')
  const fileRefs = useRef(new Map())

  const persist = (next) => {
    setItems(next)
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
    } catch {
      setError('Could not save — images may be too large for browser storage.')
    }
  }

  const update = (idx, key, val) => {
    const next = [...items]
    next[idx] = { ...next[idx], [key]: val }
    persist(next)
  }

  const add = () => persist([...items, { ...emptyProject }])
  const remove = (idx) => persist(items.filter((_, i) => i !== idx))

  const move = (idx, dir) => {
    const j = idx + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[idx], next[j]] = [next[j], next[idx]]
    persist(next)
  }

  const onImage = (idx, file) => {
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = String(reader.result)
      if (dataUrl.length > MAX_IMAGE_BYTES) {
        setError('Image is too large (max ~450KB). Compress it and try again.')
        return
      }
      update(idx, 'image', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <h2 className="h3 mb-1">Projects</h2>
      <p className="text-ink-dim text-sm mb-6">
        Manually added projects appear alongside your GitHub repos. Add an image, tags,
        and a link. Featured projects surface at the top.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2 border border-red bg-red/5 mono-data text-red-bright">
          {error}
        </div>
      )}

      {items.length === 0 && (
        <p className="mono-label mb-4">No manual projects yet — add your first below.</p>
      )}

      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="admin-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="mono-label">Project {String(idx + 1).padStart(2, '0')}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="admin-remove text-ink-dim disabled:opacity-30">↑ Up</button>
                <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="admin-remove text-ink-dim disabled:opacity-30">↓ Down</button>
                <button onClick={() => remove(idx)} className="admin-remove">Remove</button>
              </div>
            </div>

            {/* Image slot */}
            <div>
              <label className="admin-label">Cover image</label>
              <div className="flex items-start gap-3">
                <div className="w-32 aspect-[16/9] bg-sunken border border-line overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image
                    ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                    : <span className="mono-label">none</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={(el) => { if (el) fileRefs.current.set(idx, el) }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onImage(idx, e.target.files?.[0])}
                  />
                  <button onClick={() => fileRefs.current.get(idx)?.click()} className="admin-btn">Upload</button>
                  {item.image && (
                    <button onClick={() => update(idx, 'image', '')} className="admin-remove">Clear image</button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Title</label>
                <input value={item.title} onChange={(e) => update(idx, 'title', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Link (href)</label>
                <input value={item.href} onChange={(e) => update(idx, 'href', e.target.value)} placeholder="https://…" className="admin-input" />
              </div>
            </div>

            <div>
              <label className="admin-label">Description</label>
              <textarea value={item.description} onChange={(e) => update(idx, 'description', e.target.value)} rows={2} className="admin-input resize-none" />
            </div>

            <div>
              <label className="admin-label">Tags (comma-separated)</label>
              <input value={item.tags} onChange={(e) => update(idx, 'tags', e.target.value)} placeholder="React, TypeScript, Vite" className="admin-input" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="admin-label">Stars</label>
                <input type="number" min="0" value={item.stars} onChange={(e) => update(idx, 'stars', Number(e.target.value) || 0)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Forks</label>
                <input type="number" min="0" value={item.forks} onChange={(e) => update(idx, 'forks', Number(e.target.value) || 0)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Status</label>
                <input value={item.status} onChange={(e) => update(idx, 'status', e.target.value)} placeholder="Live" className="admin-input" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={!!item.featured} onChange={(e) => update(idx, 'featured', e.target.checked)} className="accent-yellow w-4 h-4" />
              <span className="mono-label normal-case tracking-normal">Featured (pin to top)</span>
            </label>
          </div>
        ))}
      </div>

      <button onClick={add} className="admin-btn">+ Add Project</button>
    </div>
  )
}
