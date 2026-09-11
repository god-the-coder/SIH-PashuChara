import { Outlet } from 'react-router-dom'

/**
 * Authentication boundary for application routes.
 *
 * It intentionally permits every route for now. Authentication and redirect
 * behaviour can be added here without changing the application route tree.
 */
function ProtectedRoute() {
  return <Outlet />
}

export default ProtectedRoute
