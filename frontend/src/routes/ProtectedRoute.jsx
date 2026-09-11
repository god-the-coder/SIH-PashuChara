import { Outlet } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

/**
 * The app supports guest browsing by design (see SplashPage / LoginPage's
 * "continue as guest" link, and the isLoggedIn-aware nav components) — this
 * does not hard-redirect unauthenticated users. Every real write already
 * requires a session on the backend; feature pages should react to a 401
 * from their own service calls (prompt login via `openAuthModal()`) rather
 * than being blocked at the route level.
 *
 * It only holds rendering until the initial session check resolves, so nested
 * pages don't render a guest UI for a flash right before a real session loads.
 */
function ProtectedRoute() {
  const { authChecked } = useDashboard()

  if (!authChecked) return null

  return <Outlet />
}

export default ProtectedRoute
