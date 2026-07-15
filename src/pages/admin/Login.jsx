import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/brand/Logo'

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || ''

export default function AdminLogin() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth')) navigate('/admin/panel', { replace: true })
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!ADMIN_PW) {
      setError('No admin password configured. Set VITE_ADMIN_PASSWORD in .env')
      return
    }
    if (pw === ADMIN_PW) {
      sessionStorage.setItem('admin_auth', '1')
      // Kept for the publish API call — the server re-validates it.
      sessionStorage.setItem('admin_pw', pw)
      navigate('/admin/panel')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="flex justify-center mb-6">
            <Logo variant="icon" size="lg" />
          </div>
          <h1 className="h3 text-center mb-1">Admin</h1>
          <p className="mono-label text-center mb-6">Enter your password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError('') }}
                placeholder="Password"
                className="admin-input"
                autoFocus
              />
              {error && <p className="mono-data text-red-bright mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full btn-yellow justify-center">
              <span>Sign In</span>
            </button>
          </form>

          <a href="/" className="block text-center mono-label mt-5 hover:text-ink transition-colors duration-240">
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  )
}
