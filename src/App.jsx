import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import { ROUTES } from './routes'

// Route-split below-fold/admin: Dashboard stays eager for LCP,
// CV + admin load on demand. SSR/prerender still renders them (no behavior change).
const CV = lazy(() => import('./pages/CV'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))

function RouteFallback() {
  return <div className="min-h-screen bg-paper" aria-hidden />
}

/**
 * Shared route table. Both the client (BrowserRouter inside App) and the
 * SSR entry (StaticRouter) reuse this so routes never drift between them.
 * Path strings come from src/routes.js — the same source prerender.mjs reads.
 */
export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path={ROUTES.home} element={<Dashboard />} />
      <Route path={ROUTES.cv} element={<CV />} />
      <Route path={ROUTES.admin} element={<AdminLogin />} />
      <Route path={ROUTES.adminPanel} element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  )
}

/**
 * Client app — wraps the route table in a BrowserRouter. For SSR, see
 * `src/entry-server.jsx` which renders <AppRoutes /> inside <StaticRouter>.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
