import { useDashboard } from "../../context/DashboardContext";
import { SUPPORTED_LANGUAGES, translations } from "../../constants/translations";
import { useState, useRef, useEffect } from "react";
import { GlobeIcon, BellIcon, CheckIcon } from "../common/Icons";

export default function AppHeader({ onOpenDrawer, onOpenNotif }) {
  const { t, lang, changeLang, notifRead, user, displayName, displayRole } = useDashboard();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "RC";

  return (
    <header className="relative z-20 px-4 pt-3.5 pb-2.5 flex items-center justify-between">
      {/* Left: Farmer avatar + Name */}
      <button
        id="userProfileBtn"
        aria-label="Farmer Profile"
        onClick={onOpenDrawer}
        className="flex items-center gap-2.5 text-left cursor-pointer group"
      >
        <div className="relative w-11 h-11 rounded-2xl bg-[#0e2c1a] text-white border border-emerald-600/30 flex items-center justify-center font-black text-sm tracking-wide shadow-md shrink-0 overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-black text-[#064d2c] dark:text-white leading-tight">
            {displayName}
          </span>
          <span className="text-[11px] font-semibold text-[#4a6b54] dark:text-[#a8cfb4] leading-tight mt-0.5">
            {displayRole}
          </span>
        </div>
      </button>

      {/* Right: Language Switcher + Notification Bell */}
      <div className="flex items-center gap-2">
        {/* Language dropdown button */}
        <div className="relative" id="langDropdownContainer" ref={langRef}>
          <button
            id="activeLangBtn"
            aria-label="Change Language"
            onClick={() => setLangMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#f4efe6] dark:bg-[#0f1110] border border-[#ded5c2] dark:border-[#252a25] text-xs font-bold text-[#064d2c] dark:text-white shadow-sm cursor-pointer"
          >
            <GlobeIcon className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t.langLabel}</span>
            <svg
              className="w-3.5 h-3.5 text-[#064d2c] dark:text-emerald-400 stroke-current stroke-[2.5] transition-transform duration-200"
              style={{ transform: langMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              fill="none" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#0f1110] rounded-2xl shadow-xl border border-[#ded5c2] dark:border-[#252a25] py-1.5 z-50 text-xs font-semibold overflow-hidden">
              {SUPPORTED_LANGUAGES.map((code) => (
                <button
                  key={code}
                  onClick={() => { changeLang(code); setLangMenuOpen(false); }}
                  className="w-full text-left px-3.5 py-2 flex items-center justify-between text-[#064d2c] dark:text-[#e8e4dc] hover:bg-emerald-50 dark:hover:bg-[#1c3c2a] transition-colors cursor-pointer"
                >
                  <span>{translations[code]?.langLabel || code}</span>
                  {lang === code && <CheckIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification bell button */}
        <button
          id="notifBellBtn"
          aria-label="Notifications"
          onClick={onOpenNotif}
          className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#f4efe6] dark:bg-[#0f1110] border border-[#ded5c2] dark:border-[#252a25] text-[#064d2c] dark:text-white shadow-sm cursor-pointer"
        >
          <BellIcon className="w-4.5 h-4.5" strokeWidth={2} />
          {!notifRead && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f59e0b] ring-2 ring-white dark:ring-[#11271b]" />
          )}
        </button>
      </div>
    </header>
  );
}

