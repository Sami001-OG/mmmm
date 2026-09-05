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

// Vercel Web Analytics — cookieless page views. No-ops outside Vercel;
// requires Analytics to be enabled once in the Vercel project dashboard.
// Deferred to idle so it never blocks hydration/LCP.
function injectAnalyticsIdle() {
  const run = () => import('@vercel/analytics').then((m) => m.inject()).catch(() => {})
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(run, { timeout: 4000 })
  } else {
    window.setTimeout(run, 2500)
  }
}

injectAnalyticsIdle()

