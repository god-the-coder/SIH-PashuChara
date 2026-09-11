import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";
import { getNotificationDisplay, formatRelativeTime } from "../../utils/notificationDisplay";

export default function NotificationModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { t, notifications, markAllRead, markNotificationRead, refreshNotifications } = useDashboard();

  useEffect(() => {
    if (isOpen) refreshNotifications();
  }, [isOpen, refreshNotifications]);

  const recent = notifications.slice(0, 5);

  const handleClick = (notification) => {
    if (!notification.is_read) markNotificationRead(notification.id);
    if (notification.action_route) {
      onClose();
      navigate(notification.action_route);
    }
  };

  return (
    <div
      id="notifModalBackdrop"
      onClick={onClose}
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div
        id="notifModalCard"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm bg-[#faf7f0] dark:bg-[#16201a] text-[#1c1c15] dark:text-[#e8e4dc] rounded-2xl shadow-2xl border border-[#ded5c2] dark:border-[#242824] overflow-hidden transform transition-all duration-300 ${isOpen ? "scale-100" : "scale-95"}`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-[#12361d] to-[#0b2112] dark:from-[#163824] dark:to-[#0f2619] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm shadow-inner">
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-white leading-tight">{t.notifModalTitle}</h3>
              <p className="text-[10px] text-emerald-200/80 dark:text-[#a8cfb4]">{t.notifModalSubtitle}</p>
            </div>
          </div>
          <button aria-label="Close Notifications" onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notification list */}
        <div className="p-3.5 space-y-2.5 max-h-[360px] overflow-y-auto">
          {recent.length === 0 && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-6">
              {t.notifEmptyState || "कोई सूचना नहीं है।"}
            </div>
          )}

          {recent.map((notification) => {
            const { icon, colorClasses, iconClasses, titleClasses } = getNotificationDisplay(notification);
            return (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 cursor-pointer ${colorClasses} ${notification.is_read ? "opacity-60" : ""}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 ${iconClasses}`}>{icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${titleClasses}`}>{notification.title}</span>
                    <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-700 dark:text-[#d1d5db] mt-0.5 leading-snug">{notification.body}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-[#f2e9d7] dark:bg-[#101210] border-t border-[#ded5c2] dark:border-[#242824] flex items-center justify-between gap-2">
          <button onClick={markAllRead} className="text-xs font-bold text-[#145227] dark:text-[#86efac] hover:underline px-2 py-1 cursor-pointer">
            {t.notifMarkReadBtn}
          </button>
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-[#143c20] dark:bg-[#1a3827] hover:bg-[#10301a] dark:hover:bg-[#204530] text-white text-xs font-bold shadow-sm cursor-pointer">
            {t.notifCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
