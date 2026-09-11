import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";
import { SUPPORTED_LANGUAGES, translations } from "../../constants/translations";

export default function SubPageHeader({
  title,
  subtitle,
  backTo = "/dashboard",
  actionBtn = null,
  showLang = true,
}) {
  const navigate = useNavigate();
  const { lang, changeLang, t } = useDashboard();
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

  return (
    <header className="px-4 py-3 bg-[#FAF7F0]/95 dark:bg-[#141814]/95 backdrop-blur-md border-b border-[#ded5c2] dark:border-[#28382d] flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => {
            if (backTo === -1) navigate(-1);
            else navigate(backTo);
          }}
          aria-label="Go Back"
          className="w-8 h-8 rounded-xl bg-white dark:bg-[#1d261f] hover:bg-gray-100 dark:hover:bg-[#263329] border border-[#ded5c2] dark:border-[#2b382e] flex items-center justify-center text-xs font-black text-gray-700 dark:text-gray-200 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
        >
          ←
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-black text-[#14351d] dark:text-[#f3ede2] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actionBtn}

        {showLang && (
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangMenuOpen((o) => !o)}
              aria-label="Change Language"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1c271e] border border-[#ded5c2] dark:border-[#2a3c2c] text-[11px] font-bold text-[#14351d] dark:text-gray-200 shadow-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-[#243327]"
            >
              <span>🌐</span>
              <span className="font-semibold">{translations[lang]?.langLabel || "हिन्दी"}</span>
              <svg
                className="w-3 h-3 text-gray-500 dark:text-gray-300 stroke-current stroke-[2.5] transition-transform duration-200"
                style={{ transform: langMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#162218] rounded-2xl shadow-xl border border-[#ded5c2] dark:border-[#283b2a] py-1 z-50 text-xs font-semibold overflow-hidden">
                {SUPPORTED_LANGUAGES.map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      changeLang(code);
                      setLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center justify-between text-[#14351d] dark:text-[#f3ede2] hover:bg-emerald-50 dark:hover:bg-[#203624] transition-colors cursor-pointer"
                  >
                    <span>{translations[code]?.langLabel || code}</span>
                    {lang === code && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
