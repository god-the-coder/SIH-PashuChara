import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard, DashboardProvider } from "../context/DashboardContext";
import { SUPPORTED_LANGUAGES, translations } from "../constants/translations";

function SplashContent() {
  const navigate = useNavigate();
  const { lang, changeLang } = useDashboard();
  const [selectedLang, setSelectedLang] = useState(lang || "hi");

  const handleStart = () => {
    changeLang(selectedLang);
    const welcomeDone = localStorage.getItem("pashuchaara_welcome_done");
    if (welcomeDone) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#faf6ed] dark:bg-[#0c130e] antialiased">
      {/* Farm Background */}
      <div className="inset-0 w-full h-full pointer-events-none z-0 overflow-hidden absolute max-w-[430px] left-1/2 -translate-x-1/2">
        <img
          src="/bg-farm.png"
          alt="Farm background"
          className="w-full h-full object-cover object-center brightness-105 contrast-95 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#12361d]/90 dark:to-[#0a180e]/95" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-6 text-white shadow-2xl">
        {/* Top bar: Badge & Brand */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black tracking-widest uppercase text-emerald-200">AI Powered</span>
          </div>
          <span className="text-xs font-mono font-bold text-white/80">v1.0</span>
        </div>

        {/* Hero Section */}
        <div className="my-auto py-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-2xl mb-6">
            <div className="w-full h-full rounded-[22px] bg-[#12361d] flex items-center justify-center text-4xl border border-white/30">
              🌾
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
            पशुचारा AI
          </h1>
          <p className="text-sm font-bold text-emerald-300 tracking-wide uppercase mt-1">
            PashuChaara AI
          </p>

          <p className="text-lg font-bold text-white/95 mt-4 max-w-xs leading-snug drop-shadow-md">
            चारे की सही जाँच, अब आपके हाथ में
          </p>
          <p className="text-xs text-white/80 mt-2 max-w-xs leading-relaxed">
            डेयरी किसानों के लिए स्मार्ट व तुरंत साइलेज व चारे की गुणवत्ता व फफूंद जाँच प्रणाली
          </p>

          {/* Language selector buttons */}
          <div className="mt-8 w-full max-w-xs">
            <label className="block text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-2">
              अपनी भाषा चुनें / Select Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((code) => {
                const isSelected = selectedLang === code;
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedLang(code)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#12361d] border-white shadow-lg scale-105"
                        : "bg-black/30 hover:bg-black/40 text-white/90 border-white/20"
                    }`}
                  >
                    {translations[code]?.langLabel || code}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pb-4 space-y-3">
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#0c2413] font-black text-base shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
          >
            <span>जाँच शुरू करें</span>
            <svg className="w-5 h-5 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <p className="text-[11px] text-center text-white/70">
            भारतीय डेयरी अनुसंधान एवं कृषि तकनीक पर आधारित
          </p>
        </div>
      </div>
    </div>
  );
}

export default SplashContent;
