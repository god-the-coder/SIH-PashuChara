import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardProvider, useDashboard } from "../context/DashboardContext";
import AppHeader from "../components/layout/AppHeader";
import WeatherStatusCard from "../components/dashboard/WeatherStatusCard";
import ActionCards from "../components/dashboard/ActionCards";
import RecordsSection from "../components/dashboard/RecordsSection";
import VoiceAssistFooter from "../components/dashboard/VoiceAssistFooter";
import ToastNotification from "../components/dashboard/ToastNotification";
import SideDrawer from "../components/modals/SideDrawer";
import NotificationModal from "../components/modals/NotificationModal";
import BottomNavBar from "../components/layout/BottomNavBar";

// Background image from the project assets
const BG_IMAGE = "/bg-farm.png";

function DashboardContent() {
  const { t, showToast } = useDashboard();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] transition-colors duration-300 antialiased flex justify-center bg-[#faf6ed] dark:bg-[#0c130e]">
      {/* Full-bleed background */}
      <div className="inset-0 w-full h-full pointer-events-none z-0 overflow-hidden absolute max-w-[430px] left-1/2 -translate-x-1/2">
        <img
          id="bg-image"
          src={BG_IMAGE}
          alt="Farm field landscape"
          className="w-full h-full object-cover object-center transition-all duration-500 brightness-100 contrast-100 dark:brightness-[0.70]"
          style={{ opacity: 0.38 }}
        />
        {/* Atmospheric scrim for high text contrast in dark and light modes */}
        <div
          id="bg-scrim"
          className="absolute inset-0 bg-[#faf6ed]/50 dark:bg-[#0c130e]/75 backdrop-blur-[0.5px] transition-colors duration-300 pointer-events-none"
        />
      </div>

      {/* App frame */}
      <div id="app" className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between overflow-x-hidden shadow-2xl bg-transparent">
        <AppHeader
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenNotif={() => setNotifOpen(true)}
        />

        <main className="relative z-10 px-4 pt-1 pb-4 flex-1 flex flex-col justify-between overflow-y-auto">
          <WeatherStatusCard />

          <section className="my-5 text-center px-1">
            <h1 className="text-[25px] sm:text-[27px] font-black tracking-tight leading-tight text-[#14351d] dark:text-white drop-shadow-sm">
              {t.mainHeadline}
            </h1>
          </section>

          <ActionCards
            onSilage={() => navigate("/inspect/new?type=silage")}
            onFeed={() => navigate("/inspect/new?type=feed")}
          />

          <RecordsSection
            onBatches={() => navigate("/batches")}
            onHistory={() => navigate("/history")}
          />

          <VoiceAssistFooter />
        </main>

        {/* Modals */}
        <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>
    </div>
  );
}

export default DashboardContent;

