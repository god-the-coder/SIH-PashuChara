import { DashboardProvider } from '../context/DashboardContext';
import ProtectedRoute from '../routes/ProtectedRoute';
import AuthModal from '../components/modals/AuthModal';
import ToastNotification from '../components/dashboard/ToastNotification';

function RootLayout() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#faf7f0] dark:bg-[#0a0c0b] text-[#1a1c18] dark:text-[#e8e4dc] transition-colors duration-300">
        <ProtectedRoute />
        <AuthModal />
        <ToastNotification />
      </div>
    </DashboardProvider>
  );
}

export default RootLayout;

