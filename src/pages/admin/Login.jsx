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
      navigate('/admin/panel')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card p-8">
          <div className="flex justify-center mb-6">
            <Logo variant="icon" size="lg" />
          </div>
          <h1 className="text-lg font-semibold text-surface-100 text-center mb-1">Admin Panel</h1>
          <p className="text-xs text-surface-400 text-center mb-6">Enter your password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError('') }}
                placeholder="Password"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-accent-400/30 focus:shadow-glow transition-all"
                autoFocus
              />
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-accent-400/10 border border-accent-400/20 text-accent-300 text-sm font-semibold hover:bg-accent-400/20 hover:shadow-glow transition-all"
            >
              Sign In
            </button>
          </form>

          <a href="/" className="block text-center text-xs text-surface-500 mt-4 hover:text-surface-300 transition-colors">
            ← Back to portfolio
          </a>
        </div>
      </div>
    </div>
  )
}
