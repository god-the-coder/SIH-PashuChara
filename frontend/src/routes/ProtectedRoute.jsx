import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

// Pages a guest (not logged in) may still reach — everything else requires a
// real session. Login/register obviously need to stay open, and splash/
// onboarding are pure pre-auth intro screens with no user data of their own.
const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/logout', '/splash', '/onboarding'])

// Path prefixes a guest may reach — for routes with a dynamic segment.
// /report/:batchCode is the QR-code destination: whoever scans a batch's QR
// in the physical world (a buyer, a vet, anyone) isn't necessarily logged in
// as the farmer who owns it, so this report view must work without a session.
const PUBLIC_PATH_PREFIXES = ['/report/']

/**
 * Authentication boundary for application routes.
 *
 * Renders nothing until the initial session check (DashboardContext's
 * authService.me() call) resolves, so pages never flash a logged-out state
 * before the real session status is known. Once resolved, any route outside
 * PUBLIC_PATHS is off-limits to a guest and redirects to /login.
 */
function ProtectedRoute() {
  const { authChecked, user } = useDashboard()
  const location = useLocation()

  if (!authChecked) return null

  const isPublic = PUBLIC_PATHS.has(location.pathname) || PUBLIC_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))
  if (!user?.isLoggedIn && !isPublic) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
