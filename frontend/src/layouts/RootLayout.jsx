import { Outlet } from 'react-router-dom';
import { DashboardProvider } from '../context/DashboardContext';
import AuthModal from '../components/modals/AuthModal';
import ToastNotification from '../components/dashboard/ToastNotification';

function RootLayout() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-[#faf6ed] dark:bg-[#0c130e] text-[#1a1c18] dark:text-[#f3ede2] transition-colors duration-300">
        <Outlet />
        <AuthModal />
        <ToastNotification />
      </div>
    </DashboardProvider>
  );
}

export default RootLayout;

