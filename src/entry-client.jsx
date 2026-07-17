import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// Hydrate the SSR'd HTML. Falls back gracefully when no SSR markup is present
// (e.g. legacy static `index.html`), in which case React mounts fresh.
// ErrorBoundary is client-only by design: SSR errors should fail the build
// loudly, not render a fallback into the static HTML.
hydrateRoot(
  document.getElementById('root'),
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
