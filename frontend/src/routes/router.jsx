import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import NotFoundPage from '../pages/NotFoundPage'
import AppFeaturePlaceholderPage from '../pages/AppFeaturePlaceholderPage'
import { ROUTES } from '../constants/routes'
import ApplicationLayout from '../layouts/ApplicationLayout'
import PublicLayout from '../layouts/PublicLayout'
import RootLayout from '../layouts/RootLayout'
import ProtectedRoute from './ProtectedRoute'

/**
 * Central route tree for PashuChara-AI.
 *
 * Public routes and application routes intentionally remain in this one
 * configuration module. The protected route boundary currently has no checks,
 * providing a focused integration point for future authentication.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        // Public route group
        path: ROUTES.HOME,
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: ROUTES.LOGIN,
            element: <LoginPage />,
          },
          {
            path: ROUTES.REGISTER,
            element: <RegisterPage />,
          },
          {
            path: ROUTES.NOT_FOUND,
            element: <NotFoundPage />,
          },
        ],
      },
      {
        // Authenticated application route group
        path: ROUTES.APP,
        element: <ProtectedRoute />,
        children: [
          {
            element: <ApplicationLayout />,
            children: [
              {
                index: true,
                element: <Navigate to={ROUTES.APP_HOME} replace />,
              },
              {
                path: ROUTES.APP_HOME,
                element: (
                  <AppFeaturePlaceholderPage
                    title="Application Home"
                    description="Your PashuChara-AI workspace is ready for its upcoming modules."
                  />
                ),
              },
              {
                path: ROUTES.INSPECTION,
                element: (
                  <AppFeaturePlaceholderPage
                    title="Inspection"
                    description="The inspection workspace will be available here soon."
                  />
                ),
              },
              {
                path: ROUTES.BATCHES,
                element: (
                  <AppFeaturePlaceholderPage
                    title="Batches"
                    description="The batch workspace will be available here soon."
                  />
                ),
              },
              {
                path: ROUTES.HISTORY,
                element: (
                  <AppFeaturePlaceholderPage
                    title="History"
                    description="The history workspace will be available here soon."
                  />
                ),
              },
              {
                path: ROUTES.FARM,
                element: (
                  <AppFeaturePlaceholderPage
                    title="Farm"
                    description="The farm workspace will be available here soon."
                  />
                ),
              },
            ],
          },
        ],
      },
      {
        // Application-wide fallback
        path: '*',
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
])
