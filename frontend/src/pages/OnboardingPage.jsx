import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard, DashboardProvider } from "../context/DashboardContext";

function OnboardingContent() {
  const navigate = useNavigate();
  const { t } = useDashboard();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "step1",
      icon: "📸",
      title: t.step1Title || "4 तस्वीरें लें",
      subtitle: t.step1Hint || "सामने, साइड, नज़दीक और भंडारण परिवेश",
      description: t.step1Desc || "सटीक जाँच के लिए पूरे ढेर का सामने का दृश्य, साइड की परतें, पास से चारे की बनावट और जहाँ चारा रखा है उस स्थान की 4 तस्वीरें लें।",
      badge: `${t.stepPrefix || "चरण"} 1`,
      badgeColor: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-300",
      tips: [
        t.voiceStep1 || "पूरे चारे का ढेर स्क्रीन में लाएँ",
        t.voiceStep3 || "नमी व फफूंद के बारीक रेशे देखें",
        t.voiceStep4 || "भंडारण शेड या फर्श भी दिखाएँ",
      ],
    },
    {
      id: "step2",
      icon: "🎙️",
      title: t.menuThemeTitle ? "लाइव वॉयस असिस्टेंट" : "Live Voice Assistant",
      subtitle: t.voiceActivePill ? "हाथ-मुक्त (Hands-free) स्पष्ट निर्देश" : "Hands-free voice guidance",
      description: t.voiceStep2 || "कैमरा खुला रखते हुए AI सहायक सीधे आपको बताएगा कि फोटो सही दूरी से आ रही है या नहीं।",
      badge: `${t.stepPrefix || "चरण"} 2`,
      badgeColor: "bg-blue-100 text-blue-900 dark:bg-blue-900/60 dark:text-blue-300",
      tips: [
        t.voiceStep1 || "कैमरा स्थिर रखें",
        t.voiceStep2 || "किनारे या साइड की परतों की फोटो लें",
        t.voiceStep3 || "बारीक बनावट साफ दिखाएँ",
      ],
    },
    {
      id: "step3",
      icon: "📋",
      title: t.resultsHeaderTitle || "सटीक परिणाम और सलाह",
      subtitle: t.qualityStatusBadge || "तुरंत फफूंद जोखिम व गुणवत्ता रिपोर्ट",
      description: t.resultSummary || "फोटो और जानकारी के आधार पर AI तुरंत चारा ठीक है या खराब है इसकी रिपोर्ट व किसान सलाह देगा।",
      badge: `${t.stepPrefix || "चरण"} 3`,
      badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300",
      tips: [
        t.safeStatus || "हरा, पीला या लाल जोखिम संकेत",
        t.resultUsability || "कितने दिन में खिलाना सुरक्षित है",
        t.rec1 || "भंडारण सुधारने के व्यावहारिक सुझाव",
      ],
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem("pashuchaara_welcome_done", "true");
    navigate("/dashboard");
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#faf7f0] dark:bg-[#0a0c0b] antialiased">
      {/* App frame */}
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-6 shadow-2xl bg-gradient-to-b from-[#faf6ed] via-[#f5ede0] to-[#ede3cf] dark:from-[#111713] dark:via-[#141d17] dark:to-[#0c130e]">
        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${slide.badgeColor}`}>
            {slide.badge} / 3
          </span>
          <button
            onClick={handleFinish}
            className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#12361d] dark:hover:text-emerald-400 cursor-pointer"
          >
            {t.onboardingSkip || "छोड़ें (Skip)"}
          </button>
        </div>

        {/* Slide Content */}
        <div className="my-auto py-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-white dark:bg-[#1a2920] border-2 border-emerald-600/30 shadow-xl flex items-center justify-center text-5xl mb-6">
            {slide.icon}
          </div>

          <h2 className="text-2xl font-black text-[#064d2c] dark:text-[#e8e4dc] tracking-tight">
            {slide.title}
          </h2>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {slide.subtitle}
          </p>

          <p className="text-xs text-gray-600 dark:text-[#a8b8ab] mt-4 leading-relaxed max-w-xs">
            {slide.description}
          </p>

          {/* Key tips */}
          <div className="mt-6 w-full max-w-xs bg-white/80 dark:bg-[#161c18]/80 rounded-2xl p-4 border border-[#ded5c2] dark:border-[#242824] text-left shadow-sm">
            <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
              {t.onboardingKeyPoints || "मुख्य बातें:"}
            </span>
            <ul className="mt-2 space-y-1.5">
              {slide.tips.map((tip, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px] font-medium text-gray-700 dark:text-[#d1dcd3]">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pb-4">
          {/* Indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === i ? "w-8 bg-emerald-600 dark:bg-emerald-400" : "w-2 bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {currentSlide > 0 && (
              <button
                onClick={() => setCurrentSlide((s) => s - 1)}
                className="py-3.5 px-5 rounded-2xl border border-[#ded5c2] dark:border-[#242824] bg-white dark:bg-[#161c18] text-[#064d2c] dark:text-[#e8e4dc] font-bold text-sm shadow-sm cursor-pointer"
              >
                {t.onboardingPrev || "पीछे"}
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 rounded-2xl bg-[#143c20] hover:bg-[#10301a] dark:bg-[#163824] dark:hover:bg-[#1e4830] text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>{currentSlide === slides.length - 1 ? (t.onboardingGoHome || "होम स्क्रीन पर चलें") : (t.onboardingNext || "आगे बढ़ें")}</span>
              <svg className="w-4 h-4 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingContent;
