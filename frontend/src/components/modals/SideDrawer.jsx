import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";

export default function SideDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { t, isDark, toggleDark, user, displayName, displayLocation } = useDashboard();

  const handleAction = (action) => {
    onClose();
    if (action === "personalInfo") {
      navigate("/profile");
    } else if (action === "cattleInfo") {
      navigate("/cattle");
    } else if (action === "settings") {
      navigate("/settings");
    } else if (action === "support") {
      navigate("/support");
    }
  };

  const handleAuthButton = () => {
    onClose();
    if (user?.isLoggedIn) {
      navigate("/logout");
    } else {
      navigate("/login");
    }
  };

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "RC";

  return (
    <div
      id="drawerBackdrop"
      onClick={onClose}
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 flex justify-center ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full max-w-[430px] h-full relative pointer-events-none overflow-hidden">
        <div
          id="sideDrawer"
          onClick={(e) => e.stopPropagation()}
          className={`pointer-events-auto absolute inset-y-0 left-0 w-[310px] max-w-[85%] h-full bg-[#FAF7F0] dark:bg-[#0f1110] text-[#1c1c15] dark:text-[#e8e4dc] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out border-r border-[#dfd5c2] dark:border-[#242824] ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#ded2bd] dark:border-[#242824] bg-gradient-to-br from-[#12361d] to-[#0b2112] dark:from-[#163824] dark:to-[#0f2619] text-white relative">
            <button
              aria-label="Close Drawer"
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white/15 text-emerald-200 border border-white/25 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black tracking-tight text-white truncate">
                  {displayName}
                </h3>
                <p className="text-[10px] text-emerald-200/90 dark:text-[#a8cfb4] mt-0.5 leading-tight truncate">
                  {displayLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div className="p-3.5 flex-1 overflow-y-auto space-y-2">
            {[
              {
                icon: "👤",
                title: t.menuPersonalInfoTitle || "व्यक्तिगत जानकारी",
                sub: t.menuPersonalInfoSub || "नाम, आयु, फोटो, ईमेल व फोन विवरण",
                action: "personalInfo",
              },
              {
                icon: "🐄",
                title: t.menuCattleInfoTitle || "पशु जानकारी",
                sub: t.menuCattleInfoSub || "नस्ल विकल्प (Gir, Sahiwal, Murrah)",
                action: "cattleInfo",
              },
              {
                icon: "⚙️",
                title: t.menuSettingsTitle || "ऐप सेटिंग्स",
                sub: t.menuSettingsSub || "फॉन्ट आकार, कैश साफ करें व यूजर प्रबंधन",
                action: "settings",
              },
              {
                icon: "📞",
                title: t.menuSupportTitle || "सहायता व संपर्क",
                sub: t.menuSupportSub || "टोल-फ्री 1800-180-1551 व वॉयस संदेश",
                action: "support",
              },
            ].map(({ icon, title, sub, action }) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#19211b] hover:bg-gray-50 dark:hover:bg-[#202b23] border border-[#e3d9c8] dark:border-[#242824] flex items-center justify-between text-left transition-colors cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-[#161914] flex items-center justify-center text-base border border-emerald-200/50 dark:border-emerald-700/30 shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#142817] dark:text-[#e8e4dc]">{title}</div>
                    <div className="text-[10px] text-gray-500 dark:text-[#a3ada0] truncate">{sub}</div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            ))}

            {/* Dark mode switch row */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#19211b] border border-[#e3d9c8] dark:border-[#242824] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-[#161914] flex items-center justify-center text-base border border-emerald-200/50 dark:border-emerald-700/30 shrink-0">
                  {isDark ? "🌙" : "☀️"}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#142817] dark:text-[#e8e4dc]">
                    {t.menuThemeTitle || "डार्क / लाइट मोड"}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-[#a3ada0]">
                    {isDark ? (t.drawerThemeDarkActive || "डार्क थीम सक्रिय") : (t.drawerThemeLightActive || "लाइट थीम सक्रिय")}
                  </div>
                </div>
              </div>
              <button
                id="drawerThemeToggleBtn"
                aria-label="Toggle Theme"
                onClick={toggleDark}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isDark ? "bg-[#2D5A3D]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer with Login / Logout Button */}
          <div className="p-3.5 border-t border-[#ded2bd] dark:border-[#242824] bg-[#f4ebd9] dark:bg-[#101612] flex items-center justify-between">
            <button
              onClick={handleAuthButton}
              className={`flex items-center gap-2 text-xs font-black cursor-pointer ${
                user?.isLoggedIn
                  ? "text-red-600 dark:text-[#fca5a5] hover:text-red-700"
                  : "text-emerald-800 dark:text-emerald-400 hover:text-emerald-900"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>{user?.isLoggedIn ? (t.drawerLogoutLabel || "लॉग आउट") : (t.drawerLoginLabel || "लॉगिन / साइन-अप")}</span>
            </button>

            <span className="text-[10px] text-gray-500 dark:text-[#8b9788] font-bold font-mono">
              v2.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
