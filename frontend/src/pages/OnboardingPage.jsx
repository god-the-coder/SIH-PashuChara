import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";

// Language metadata for bottom sheet
const LANG_META = [
  { code: "hi", native: "हिन्दी", latin: "Hindi" },
  { code: "en", native: "English", latin: "अंग्रेज़ी" },
  { code: "mr", native: "मराठी", latin: "Marathi" },
  { code: "ta", native: "தமிழ்", latin: "Tamil" },
  { code: "kn", native: "ಕನ್ನಡ", latin: "Kannada" },
];

// Per-step config
const STEPS = [
  {
    id: "step1",
    badgeHi: "पहला कदम • 01 / 03",
    badgeEn: "Step 1 • 01 / 03",
    headlineHi: "कैमरा चारे की ओर करें",
    headlineEn: "Point camera at fodder",
    subtextHi: "सामने, साइड, नज़दीक और भंडारण परिवेश की 4 तस्वीरें लें।",
    subtextEn: "Take 4 photos: front, side, close-up, and storage area.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAckvpFSK0Ofw9eqk5xWYz9USRgImMnn9qSueRtdg80DASUc1uj_akKBJ5o5XXnqu0HBu1cZ5CReuJIXdGtc7SugfLVSBiZISFkFj_F4FgvfRS_zEt6yH9QZNQXTfGO7R5yDZfEc4jyLUz4N_DnRgXPrK6u-kk4eI7J2KiHcM_UCFnGAZ0O_bU9apfYph5ZCfrSAUMGSZWos6l6OHHnbrjx2XBHpx3z0xY1oxKuQvTu1VfUpbSz-60q3iAezaS2JZD5Ma0",
    imageAlt: "गाय के चारे की मोबाइल द्वारा जाँच",
    voiceBadge: null,
    ctaHi: "अगला कदम",
    ctaEn: "Next Step",
  },
  {
    id: "step2",
    badgeHi: "दूसरा कदम • 02 / 03",
    badgeEn: "Step 2 • 02 / 03",
    headlineHi: "आवाज़ के निर्देश सुनें",
    headlineEn: "Listen to voice instructions",
    subtextHi:
      "लाइव वॉइस असिस्टेंट आपको हिंदी में बताएगा कि कब और कैसे फोटो लेनी है।",
    subtextEn:
      "Live voice assistant will guide you in your language on when and how to take photos.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD83nEMe5VGBHCss_QohfU-ZipBU2EUtuzQaW1VDL3m9Ov2js1Uu6FkeislLbWEyZRTf5ENT7P92Y_NcnPzwdxcrkSPKhDGJ3bNxvIah9DHQdynyV495i0vhEiyCom2mXTD3lxrYmQ5pE2Jlrr3aK3KSjTWpjIgP-hSzaFXfCVkKyjQJELCmfTY70-TZbY0WdpkC5_SiTQ756UjNvalnibuqg0vIXbB8Uh1wrCk-bU2fxC2o2WRsEORD3uAWARH44fFsSM",
    imageAlt:
      "भारतीय डेयरी किसान पशुचारा ऐप पर लाइव वॉइस असिस्टेंट के साथ चारे की तस्वीर लेते हुए",
    voiceBadge: { hi: "वॉइस एक्टिव", en: "Voice Active" },
    ctaHi: "अगला कदम",
    ctaEn: "Next Step",
  },
  {
    id: "step3",
    badgeHi: "तीसरा कदम • 03 / 03",
    badgeEn: "Step 3 • 03 / 03",
    headlineHi: "सटीक परिणाम और सलाह पाएँ",
    headlineEn: "Get accurate results & advice",
    subtextHi:
      "चारे की गुणवत्ता और जोखिम की स्थिति समझें, और तुरंत क्या सावधानी बरतें।",
    subtextEn:
      "Understand fodder quality and risk status, and know what precaution to take immediately.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBhBgCj7r_HjkCHFcu9E8ZMmP91YnprgdRUt6QHqf_516pmdSR6cIYpzoEqvrdPvZqWo2LvUbbcTpoc0Z8719cdMGjXnD2z0RpM8GIpo1DHHut9qKMeQFJYmxqVB8E-9hQgIlvXaCAfhWEkX4Naz9PQaDK-gtL9BZfB7yQx4SiDyHPlQUQVImWoEWqPcxyKAppVSMXcq_B3kA4sj6ZpMvhXB3TG2BNHLhhT8XpGOhs0Ol06_na1y93onw",
    imageAlt: "संतुष्ट किसान चारे की गुणवत्ता जांचने के बाद",
    voiceBadge: null,
    trustBadge: true,
    ctaHi: "शुरू करें",
    ctaEn: "Get Started",
  },
];

function OnboardingContent() {
  const navigate = useNavigate();
  const { lang, changeLang, t } = useDashboard();
  const [step, setStep] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [imgError, setImgError] = useState({});

  const isHi = lang === "hi";
  const current = STEPS[step];

  const currentLangNative =
    LANG_META.find((l) => l.code === lang)?.native || "हिन्दी";

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      navigate("/");
    }
  };

  const handleFinish = () => {
    localStorage.setItem("pashuchaara_welcome_done", "true");
    navigate("/dashboard");
  };

  const selectLang = (code) => {
    changeLang(code);
    setSheetOpen(false);
  };

  const badge = isHi ? current.badgeHi : current.badgeEn;
  const headline = isHi ? current.headlineHi : current.headlineEn;
  const subtext = isHi ? current.subtextHi : current.subtextEn;
  const ctaLabel = isHi ? current.ctaHi : current.ctaEn;

  return (
    <div
      className="relative min-h-screen w-full flex justify-center antialiased"
      style={{
        background: "#ECE8E1",
        fontFamily:
          "'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Kannada', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Mobile shell */}
      <main
        className="relative w-full max-w-[412px] h-screen flex flex-col justify-between overflow-hidden shadow-2xl"
        style={{ background: "#FAF8F4" }}
      >
        {/* Top section: nav + badge + headline */}
        <div className="relative z-20 flex flex-col pt-3 px-5">
          {/* Nav row */}
          <nav className="flex items-center justify-between py-2">
            {/* Back */}
            <button
              type="button"
              aria-label="पीछे जाएं"
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-white shadow-sm border border-stone-200/70 flex items-center justify-center text-emerald-800 hover:bg-stone-50 active:scale-95 transition-transform cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Right: lang + skip */}
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                id="lang-selector-btn"
                aria-label="भाषा चुनें"
                onClick={() => setSheetOpen(true)}
                className="h-9 px-3.5 bg-white border border-stone-200/80 rounded-full shadow-sm flex items-center space-x-1.5 text-emerald-700 hover:bg-stone-50 active:scale-95 transition-transform cursor-pointer"
              >
                <span className="text-sm">🌐</span>
                <span className="text-xs font-semibold tracking-wide text-emerald-700">
                  {currentLangNative}
                </span>
                <svg className="w-3.5 h-3.5 text-emerald-700 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                id="skip-btn"
                onClick={handleFinish}
                className="bg-white/80 px-3.5 py-1.5 rounded-full border border-stone-200/80 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                {t.onboardingSkip || "छोड़ें"}
              </button>
            </div>
          </nav>

          {/* Step badge */}
          <div className="flex justify-center mt-3">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold tracking-tight bg-white border border-stone-200/90 text-emerald-700 shadow-sm">
              {badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[25px] font-bold text-stone-900 tracking-tight leading-snug text-center mt-3">
            {headline}
          </h1>

          {/* Subtext */}
          <p className="text-[14px] text-stone-600 mt-1.5 leading-relaxed max-w-[280px] mx-auto font-normal text-center min-h-[44px] flex items-center justify-center">
            {subtext}
          </p>
        </div>

        {/* Hero image */}
        <div className="relative flex-1 w-full flex items-center justify-center mt-2 px-4 overflow-hidden">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-sm border border-stone-200/60 bg-stone-100">
            <img
              src={current.image}
              alt={current.imageAlt}
              onError={() => setImgError((p) => ({ ...p, [step]: true }))}
              className="w-full h-full object-cover object-center"
              style={{
                maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)",
              }}
            />
            {/* Bottom fade into bg */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, #FAF8F4 0%, transparent 35%)",
                opacity: 0.92,
              }}
            />

            {/* Voice active badge (step 2) */}
            {current.voiceBadge && (
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-emerald-700/20 py-1 px-2.5 rounded-full shadow-sm flex items-center space-x-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="text-[11px] font-semibold text-emerald-800">
                  {isHi ? current.voiceBadge.hi : current.voiceBadge.en}
                </span>
              </div>
            )}

            {/* Trust badge (step 3) */}
            {current.trustBadge && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-emerald-700/20 py-2 px-4 rounded-2xl shadow-md flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-[11px] font-bold text-stone-900 leading-tight">
                    {isHi ? "गुणवत्ता व स्वास्थ्य आश्वासन" : "Quality & Health Assurance"}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {isHi ? "AI जाँच प्रमाणित" : "AI verified inspection"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: dots + CTA */}
        <footer className="relative z-20 px-6 pt-1 pb-8 flex flex-col items-center">
          {/* Dot indicators */}
          <div className="flex items-center space-x-2 mb-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  width: i === step ? "28px" : "10px",
                  height: "10px",
                  borderRadius: "999px",
                  background: i === step
                    ? "#1B5E20"
                    : i < step
                    ? "#1B5E20AA"
                    : "#D1C9BF",
                }}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* CTA */}
          <button
            id="next-step-btn"
            type="button"
            onClick={handleNext}
            className="w-full h-14 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2.5 active:scale-[0.98] transition-all cursor-pointer"
            style={{
              background: "#1B5E20",
              boxShadow: "0 8px 24px -4px rgba(27,94,32,0.35)",
            }}
          >
            <span>{ctaLabel}</span>
            <svg className="w-5 h-5 text-white stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </footer>
      </main>

      {/* --- Language bottom sheet --- */}
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

        {/* Sheet */}
        <div
          className="relative w-full max-w-[430px] bg-white rounded-t-3xl shadow-2xl p-6 border-t border-stone-200 z-10 transition-transform duration-[280ms]"
          style={{ transform: sheetOpen ? "translateY(0%)" : "translateY(100%)" }}
        >
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                भाषा चुनें (Select Language)
              </h2>
              <p className="text-xs text-stone-500">अपनी पसंदीदा क्षेत्रीय भाषा का चयन करें</p>
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </div>

          <div className="space-y-1.5">
            {LANG_META.map((lm) => {
              const isSel = lang === lm.code;
              return (
                <button
                  key={lm.code}
                  type="button"
                  onClick={() => selectLang(lm.code)}
                  className={`w-full min-h-[52px] px-4 py-3 rounded-xl flex items-center justify-between transition cursor-pointer ${
                    isSel
                      ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                      : "hover:bg-stone-50 text-stone-800 font-medium border border-transparent"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-base leading-tight">{lm.native}</span>
                    <span className="text-xs font-normal opacity-70">{lm.latin}</span>
                  </div>
                  {isSel && (
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs">
                      ✓
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

export default OnboardingContent;
