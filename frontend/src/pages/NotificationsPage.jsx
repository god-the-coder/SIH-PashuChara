import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";
import { getNotificationDisplay, formatRelativeTime } from "../utils/notificationDisplay";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { t, notifications, markAllRead, markNotificationRead, refreshNotifications } = useDashboard();

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleAction = (notification) => {
    if (!notification.is_read) markNotificationRead(notification.id);
    if (notification.action_route) navigate(notification.action_route);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.notifModalTitle || "सूचनाएँ एवं अलर्ट"}
          subtitle="मौसम चेतावनी व साइलेज अनुस्मारक"
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t.notifMarkReadBtn || "सभी पढ़ा"}
            </button>
          }
        />

        {/* Alerts List */}
        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
              {t.notifEmptyState || "कोई सूचना नहीं है।"}
            </div>
          )}

          {notifications.map((notification) => {
            const { icon, colorClasses, iconClasses } = getNotificationDisplay(notification);
            return (
              <div
                key={notification.id}
                className={`p-4 rounded-3xl border ${colorClasses} shadow-sm space-y-2 ${notification.is_read ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 ${iconClasses}`}>
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-[#064d2c] dark:text-white leading-tight">
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    <p className="text-xs text-gray-700 dark:text-[#d1d5db] mt-1 leading-snug">
                      {notification.body}
                    </p>
                  </div>
                </div>

                {notification.action_label && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAction(notification)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>{notification.action_label}</span>
                      <span className="text-xs">→</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
