import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { SUPPORTED_LANGUAGES, translations } from "../constants/translations";
import { CheckIcon } from "../components/common/Icons";

// Language metadata for bottom sheet
const LANG_META = [
  { code: "hi", native: "हिन्दी", latin: "Hindi" },
  { code: "en", native: "English", latin: "अंग्रेज़ी" },
  { code: "mr", native: "मराठी", latin: "Marathi" },
  { code: "ta", native: "தமிழ்", latin: "Tamil" },
  { code: "kn", native: "ಕನ್ನಡ", latin: "Kannada" },
];

function SplashContent() {
  const navigate = useNavigate();
  const { lang, changeLang, t } = useDashboard();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentLangNative =
    LANG_META.find((l) => l.code === lang)?.native ||
    translations[lang]?.langLabel ||
    "हिन्दी";

  const handleStart = () => {
    const welcomeDone = localStorage.getItem("pashuchaara_welcome_done");
    if (welcomeDone) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  const selectLang = (code) => {
    changeLang(code);
    setSheetOpen(false);
  };

  return (
    <div
      className="relative min-h-screen w-full flex justify-center bg-black overflow-hidden antialiased"
      style={{ fontFamily: "'Hind', 'Poppins', sans-serif" }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Mobile shell */}
      <div className="relative h-screen w-full max-w-[430px] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* --- Background photo + scrim --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHQHuOHxsQHW6FyleiFvxNjSgGgc-cjRLZrERB72eC7-zPjAshvQGu9usBQKcZqtgLNipSqmT6BE57S-swj__iyiVJXH5S4w3nXLPINcHBNc2C2ERh1EHLs6bgQ1DufHzBilDxfCnpdDfwfjIC4vAnb8cBmajVCuCto5ceIkYcelEcvlP67pN4XfAGKVLp3af0ND8V53B-lsF1uRFkdB5-H1SCSYzO92wIgBIgwNMZFOyEcHM_JxJNWbbj9sgvbJjZYiw"
            alt="भारतीय किसान और गाय"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(8,32,14,0.90) 0%, rgba(10,42,19,0.68) 26%, rgba(10,42,19,0.30) 48%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        {/* --- Header --- */}
        <header className="relative z-10 w-full pt-4 px-5">
          {/* App brand row */}
          <nav className="flex items-center justify-between pt-1 pb-2">
            {/* Logo + brand */}
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0 p-1.5">
                <svg className="w-7 h-7 text-emerald-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3c2.64-1.28 6.09-3.7 7.42-6.57.87.54 1.89.87 3 .87 3.31 0 6-2.69 6-6s-2.69-6-6-6c-1.89 0-3.56.88-4.66 2.25C13.25 8.16 14.93 8 17 8m0-6c-2.45 0-4.52 1.47-5.46 3.57C10.63 5.21 9.38 5 8 5c-3.87 0-7 3.13-7 7 0 1.93.78 3.68 2.05 4.95C4.24 13.9 6.2 10.4 12 9c0-3.87 2.24-7 5-7z" />
                </svg>
              </div>
              <div>
                <div className="flex items-baseline tracking-tight leading-none">
                  <span className="text-white font-extrabold text-xl">Pashui</span>
                  <span className="text-emerald-400 font-extrabold text-xl">Chara</span>
                </div>
                <p className="text-[11px] font-medium text-emerald-200/90 mt-0.5">
                  पशु चारा गुणवत्ता साथी
                </p>
              </div>
            </div>

            {/* Language pill */}
            <button
              id="lang-button"
              type="button"
              aria-label="भाषा चुनें"
              onClick={() => setSheetOpen(true)}
              className="flex items-center space-x-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-sm text-white font-medium text-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>{currentLangNative}</span>
              <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd" />
              </svg>
            </button>
          </nav>
        </header>

        {/* --- Hero content --- */}
        <main className="relative z-10 px-6 pt-4 text-left flex-1 flex flex-col justify-end pb-4">
          <h1
            className="text-[29px] sm:text-[32px] font-extrabold text-white leading-[1.22] tracking-tight max-w-[340px]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
          >
            {t.splashSubtitle || "पशु चारे की सही जाँच,"}
            <br />
            अब आपके हाथ में
          </h1>
          <p
            className="text-emerald-100/95 text-[15px] font-medium mt-3 max-w-[310px] leading-relaxed"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            {t.splashDesc ||
              "फोटो लें, सवालों के जवाब दें और चारे की गुणवत्ता व फफूंद जोखिम तुरंत समझें।"}
          </p>
        </main>

        {/* --- CTA footer --- */}
        <footer className="relative z-10 w-full px-6 pb-10 pt-4">
          <button
            id="cta-button"
            type="button"
            onClick={handleStart}
            className="w-full h-14 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 active:scale-[0.98] transition-all rounded-full text-stone-950 font-bold text-lg shadow-[0_8px_25px_rgba(245,158,11,0.45)] flex items-center justify-center space-x-2.5 cursor-pointer"
          >
            <span>{t.splashCta || "जाँच शुरू करें"}</span>
            <svg className="w-5 h-5 text-stone-950 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-center text-[11px] text-white/60 mt-3">
            {t.splashFooter || "भारतीय डेयरी अनुसंधान एवं कृषि तकनीक पर आधारित"}
          </p>
        </footer>
      </div>

      {/* --- Language Bottom Sheet --- */}
      <div
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{
          pointerEvents: sheetOpen ? "auto" : "none",
          visibility: sheetOpen ? "visible" : "hidden",
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity duration-250"
          style={{ opacity: sheetOpen ? 1 : 0 }}
          onClick={() => setSheetOpen(false)}
        />

        {/* Sheet card */}
        <div
          className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl p-6 border-t border-stone-200 z-10 transition-transform duration-[280ms]"
          style={{
            transform: sheetOpen ? "translateY(0%)" : "translateY(100%)",
          }}
        >
          {/* Handle */}
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

          {/* Sheet header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                भाषा चुनें (Select Language)
              </h2>
              <p className="text-xs text-stone-500">अपनी पसंदीदा क्षेत्रीय भाषा का चयन करें</p>
            </div>
            <button
              type="button"
              aria-label="बंद करें"
              onClick={() => setSheetOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Language options */}
          <div className="space-y-1.5">
            {LANG_META.map((lm) => {
              const isSelected = lang === lm.code;
              return (
                <button
                  key={lm.code}
                  type="button"
                  onClick={() => selectLang(lm.code)}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-xl flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                      : "hover:bg-stone-50 text-stone-800 font-medium border border-transparent"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-base leading-tight">{lm.native}</span>
                    <span className="text-xs font-normal opacity-70">{lm.latin}</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs">
                      <CheckIcon className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashContent;
