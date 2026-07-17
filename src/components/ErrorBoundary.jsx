import { Component } from 'react'

// Last-resort guard: a runtime error anywhere below unmounts to this card
// instead of a blank page. Kept dependency-free (plain elements + utility
// classes) so the boundary itself can never be the thing that crashes.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="card p-8 max-w-sm w-full text-center">
          <p className="h3">Something went wrong</p>
          <p className="text-ink-dim text-sm mt-2">
            An unexpected error broke this page. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-yellow justify-center mt-6 w-full"
          >
            <span>Reload page</span>
          </button>
        </div>
      </div>
    )
  }
}
