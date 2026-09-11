import { Outlet } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

/**
 * Authentication boundary for application routes.
 *
 * Renders nothing until the initial session check (DashboardContext's
 * authService.me() call) resolves, so pages never flash a logged-out state
 * before the real session status is known.
 */
function ProtectedRoute() {
  const { authChecked } = useDashboard()
  if (!authChecked) return null
  return <Outlet />
}

export default ProtectedRoute
