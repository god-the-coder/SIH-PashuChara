import { useNavigate, useLocation } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, notifRead } = useDashboard();

  const navItems = [
    {
      id: "nav-home",
      path: "/dashboard",
      label: t.navHome || "होम",
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? "2" : "2"} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "nav-history",
      path: "/history",
      label: t.navHistory || "इतिहास",
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "nav-notifications",
      path: "/notifications",
      label: t.navAlerts || "सूचनाएँ",
      badge: !notifRead,
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: "nav-farm",
      path: "/farm",
      label: t.navFarm || "फार्म",
      icon: (active) => (
        <svg className={`w-5 h-5 ${active ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-white/95 dark:bg-[#111713]/95 backdrop-blur-md border-t border-[#dfd5c2] dark:border-[#28382d] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-emerald-800 dark:text-emerald-300 font-extrabold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
              }`}
            >
              <div className="relative">
                {item.icon(isActive)}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#111713]" />
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight leading-none">{item.label}</span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
