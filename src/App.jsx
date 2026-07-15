import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CV from './pages/CV'
import AdminLogin from './pages/admin/Login'
import AdminPanel from './pages/admin/AdminPanel'
import NotFound from './pages/NotFound'
import { ROUTES } from './routes'

/**
 * Shared route table. Both the client (BrowserRouter inside App) and the
 * SSR entry (StaticRouter) reuse this so routes never drift between them.
 * Path strings come from src/routes.js — the same source prerender.mjs reads.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<Dashboard />} />
      <Route path={ROUTES.cv} element={<CV />} />
      <Route path={ROUTES.admin} element={<AdminLogin />} />
      <Route path={ROUTES.adminPanel} element={<AdminPanel />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
