import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import AppHeader from "../components/layout/AppHeader";
import WeatherStatusCard from "../components/dashboard/WeatherStatusCard";
import ActionCards from "../components/dashboard/ActionCards";
import VoiceAssistFooter from "../components/dashboard/VoiceAssistFooter";
import ToastNotification from "../components/dashboard/ToastNotification";
import SideDrawer from "../components/modals/SideDrawer";
import NotificationModal from "../components/modals/NotificationModal";
import BottomNavBar from "../components/layout/BottomNavBar";
import farmService from "../services/farm/farmService";
import batchService from "../services/batches/batchService";
import inspectionService from "../services/inspection/inspectionService";

const BG_IMAGE = "/bg-farm.png";

export default function DashboardPage() {
  const { t } = useDashboard();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [stats, setStats] = useState({ cattle: null, batches: null, scans: null });

  useEffect(() => {
    let cancelled = false;

    farmService.getMyFarm().then((farm) => {
      if (!cancelled) setStats((prev) => ({ ...prev, cattle: farm?.total_cattle ?? 0 }));
    }).catch(() => {
      if (!cancelled) setStats((prev) => ({ ...prev, cattle: 0 }));
    });

    batchService.list().then((batches) => {
      if (!cancelled) setStats((prev) => ({ ...prev, batches: batches.length }));
    }).catch(() => {
      if (!cancelled) setStats((prev) => ({ ...prev, batches: 0 }));
    });

    inspectionService.list().then((inspections) => {
      if (!cancelled) setStats((prev) => ({ ...prev, scans: inspections.length }));
    }).catch(() => {
      if (!cancelled) setStats((prev) => ({ ...prev, scans: 0 }));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#ede7db] dark:bg-[#050706]">

      {/* -- Farm background strictly contained inside app window -- */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden bg-[#faf7f0] dark:bg-[#0a0c0b]">
          <img
            id="bg-image"
            src={BG_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.38 }}
          />
          <div id="bg-scrim" className="absolute inset-0" />
        </div>
      </div>

      {/* -- App shell -- */}
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col shadow-2xl border-x border-[#ded6c7] dark:border-[#1d221f]">

        <AppHeader
          onOpenDrawer={() => setDrawerOpen(true)}
          onOpenNotif={() => setNotifOpen(true)}
        />

        <main className="flex-1 flex flex-col px-4 pt-1 pb-6 overflow-y-auto">

          {/* Welcome Card (Moved up ~50-70px, 24-32px from header) */}
          <div className="mt-4">
            <WeatherStatusCard />
          </div>

          {/* Headline (↓ 32px from welcome card) */}
          <section className="text-center px-2 mt-8">
            <h1 className="text-xl font-black tracking-tight leading-tight text-[#064d2c] dark:text-white drop-shadow-sm">
              {t.mainHeadline}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {t.mainSubheadline || "Test silage or fodder quality"}
            </p>
          </section>

          {/* Action cards (↓ 28px from headline; 20px gap between cards inside) */}
          <div className="mt-7">
            <ActionCards
              onSilage={() => navigate("/inspect/new?type=silage")}
              onFeed={() => navigate("/inspect/new?type=feed")}
            />
          </div>

          {/* Quick Stats row (↓ 32px from action cards) */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { val: stats.cattle ?? "...", label: t.statCattle || "Cattle", icon: (
                <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )},
              { val: stats.batches ?? "...", label: t.statBatches || "Batches", icon: (
                <svg className="w-4.5 h-4.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              )},
              { val: stats.scans ?? "...", label: t.statScans || "Scans", icon: (
                <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              )},
            ].map((s, i) => (
              <div key={i} className="px-3 py-3 rounded-2xl bg-white/85 dark:bg-white/5 border border-[#e8e2d8] dark:border-white/10 backdrop-blur-sm flex flex-col items-center gap-1 shadow-sm hover:border-[#10b96a]/40 transition-colors">
                {s.icon}
                <span className="text-lg font-black text-[#1a1c18] dark:text-white leading-none">{s.val}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Voice Assist (Reduced stats → voice gap ~28px) */}
          <div className="mt-7 mb-2">
            <VoiceAssistFooter />
          </div>
        </main>

        <BottomNavBar />

        {/* Modals */}
        <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <NotificationModal isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        <ToastNotification />
      </div>
    </div>
  );
}
