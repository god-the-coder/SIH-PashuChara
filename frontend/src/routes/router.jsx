import { createBrowserRouter, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import LogoutPage from '../pages/LogoutPage'
import RegisterPage from '../pages/RegisterPage'
import NotFoundPage from '../pages/NotFoundPage'
import DashboardPage from '../pages/DashboardPage'
import SplashPage from '../pages/SplashPage'
import OnboardingPage from '../pages/OnboardingPage'
import NewInspectionPage from '../pages/NewInspectionPage'
import InspectionQuestionnairePage from '../pages/InspectionQuestionnairePage'
import AiQuestionnairePage from '../pages/AiQuestionnairePage'
import ResultsPage from '../pages/ResultsPage'
import BatchesPage from '../pages/BatchesPage'
import HistoryPage from '../pages/HistoryPage'
import MoreInfoPage from '../pages/MoreInfoPage'
import LabReportPage from '../pages/LabReportPage'
import NotificationsPage from '../pages/NotificationsPage'
import FarmPage from '../pages/FarmPage'
import ProfilePage from '../pages/ProfilePage'
import CattlePage from '../pages/CattlePage'
import SettingsPage from '../pages/SettingsPage'
import SupportPage from '../pages/SupportPage'
import QrReportScannerPage from '../pages/QrReportScannerPage'
import CloudBatchReportPage from '../pages/CloudBatchReportPage'
import RootLayout from '../layouts/RootLayout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <SplashPage />,
      },
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/logout',
        element: <LogoutPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/home',
        element: <DashboardPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/cattle',
        element: <CattlePage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/support',
        element: <SupportPage />,
      },
      {
        path: '/inspect/new',
        element: <NewInspectionPage />,
      },
      {
        path: '/qr-report',
        element: <QrReportScannerPage />,
      },
      {
        path: '/qr-report/batch/:batchCode',
        element: <CloudBatchReportPage />,
      },
      {
        path: '/inspect/questions',
        element: <InspectionQuestionnairePage />,
      },
      {
        path: '/inspect/ai-questions',
        element: <AiQuestionnairePage />,
      },
      {
        path: '/results/:id',
        element: <ResultsPage />,
      },
      {
        path: '/batches',
        element: <BatchesPage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
      {
        path: '/history/:id/info',
        element: <MoreInfoPage />,
      },
      {
        path: '/history/:id/report',
        element: <LabReportPage />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/farm',
        element: <FarmPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
