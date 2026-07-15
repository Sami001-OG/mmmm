import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { PRERENDER_ROUTES, SHELL_ROUTES, ROUTE_META, SITE_URL } from './routes'

/**
 * SSR render function. Receives the request URL and returns the
 * server-rendered HTML string for the matching route. Consumed by both
 * `server.js` (dev/prod SSR) and `scripts/prerender.mjs` (static export).
 */
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>
  )
}

// Re-exported so prerender.mjs reads the route list + meta from ONE place
// (src/routes.js) rather than keeping its own drifting copy.
export { PRERENDER_ROUTES, SHELL_ROUTES, ROUTE_META, SITE_URL }
