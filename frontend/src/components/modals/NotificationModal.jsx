import { useDashboard } from "../../context/DashboardContext";

export default function NotificationModal({ isOpen, onClose }) {
  const { t, markAllRead } = useDashboard();

  const notifications = [
    { 
      id: "notif1", 
      type: "warning", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ), 
      title: t.notif1Title, 
      body: t.notif1Body, 
      time: "20 min", 
      colorClasses: "bg-amber-500/10 dark:bg-[#2d2319] border-amber-500/30 dark:border-amber-700/30", 
      iconClasses: "bg-amber-500/20 text-amber-700 dark:text-[#fcd34d]", 
      titleClasses: "text-amber-950 dark:text-[#fef08a]" 
    },
    { 
      id: "notif2", 
      type: "info", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      title: t.notif2Title, 
      body: t.notif2Body, 
      time: "2 hrs", 
      colorClasses: "bg-emerald-500/10 dark:bg-[#161914] border-emerald-500/30 dark:border-emerald-700/30", 
      iconClasses: "bg-emerald-500/20 text-[#13381e] dark:text-[#86efac]", 
      titleClasses: "text-emerald-950 dark:text-[#bbf7d0]" 
    },
    { 
      id: "notif3", 
      type: "weather", 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ), 
      title: t.notif3Title, 
      body: t.notif3Body, 
      time: "10:00 AM", 
      colorClasses: "bg-blue-500/10 dark:bg-[#182736] border-blue-500/30 dark:border-blue-700/30", 
      iconClasses: "bg-blue-500/20 text-blue-700 dark:text-[#93c5fd]", 
      titleClasses: "text-blue-950 dark:text-[#bfdbfe]" 
    },
  ];

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
          {notifications.map(({ id, icon, title, body, time, colorClasses, iconClasses, titleClasses }) => (
            <div key={id} className={`p-3 rounded-xl border flex items-start gap-3 ${colorClasses}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 ${iconClasses}`}>{icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${titleClasses}`}>{title}</span>
                  <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">{time}</span>
                </div>
                <p className="text-[11px] text-gray-700 dark:text-[#d1d5db] mt-0.5 leading-snug">{body}</p>
              </div>
            </div>
          ))}
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
