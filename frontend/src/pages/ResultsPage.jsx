import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, showToast } = useDashboard();

  const rawImages = sessionStorage.getItem("pashuchaara_temp_images");
  const capturedImages = rawImages ? JSON.parse(rawImages) : null;
  const fodderType = sessionStorage.getItem("pashuchaara_temp_type") || "मक्का साइलेज";

  const resultData = {
    isFodderValid: true,
    riskLevel: "low",
    statusLabel: t.safeStatus || "ठीक (खिलाने योग्य)",
    confidence: "high",
    summary: "साइलेज का रंग अच्छा हरा-पीला है और किण्वन सामान्य दिख रहा है। कोई दिखाई देने वाली फफूंद या सड़न नहीं पाई गई। भंडारण शेड सूखा और सुरक्षित है।",
    estimatedUsabilityWindow: "4-6 दिन में नियमित उपयोग करें और अच्छी तरह ढकें",
    reasons: [
      "सामने व साइड की परतों में कोई सफेद या काली फफूंद के धब्बे नहीं दिखे।",
      "चारे की कतरन (chop length) सही है और नमी का स्तर सामान्य प्रतीत होता है।",
      "भंडारण स्थान पर सीधा पानी या सीलन का संपर्क नहीं है।",
    ],
    recommendations: [
      "साइलेज निकालते समय हवा के संपर्क को कम करने के लिए परत से सीधा काटें।",
      "दैनिक खुराक निकालने के तुरंत बाद तिरपाल को पत्थरों या टायरों से कसकर दबाएँ।",
      "बदलते मौसम और अधिक आर्द्रता के कारण हर 3-4 दिन में दोबारा जाँच करें।",
    ],
    visualIndicators: [
      { name: "रंग व ताजगी", status: "अच्छा (हरी-पीली बनावट)" },
      { name: "फफूंद / सड़न", status: "नहीं दिखी (सुरक्षित)" },
      { name: "भंडारण सुरक्षा", status: "सुरक्षित व ढका हुआ" },
    ],
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "पशुचारा AI जाँच रिपोर्ट",
        text: `${fodderType} की जाँच रिपोर्ट: स्थिति - ${resultData.statusLabel}. ${resultData.summary}`,
      }).catch(() => {});
    } else {
      showToast("रिपोर्ट लिंक कॉपी हो गया! 📋");
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.resultsHeaderTitle || "AI गुणवत्ता जाँच रिपोर्ट"}
          subtitle="आईडी: #PC-9482 • आज"
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c271e] border border-[#ded5c2] dark:border-[#2a3c2c] text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-50"
            >
              📤
            </button>
          }
        />

        {/* Report Content */}
        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Main Risk Badge Banner */}
          <div className="rounded-3xl p-4 bg-gradient-to-br from-[#12361d] to-[#0c2413] text-white shadow-lg border border-emerald-600/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase text-emerald-300 tracking-wider">
                  {t.qualityStatusBadge || "गुणवत्ता स्थिति"}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-bold text-white">
                {t.highAccuracyTag || "उच्च सटीकता"}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {resultData.statusLabel}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1.5 leading-relaxed">
                {resultData.summary}
              </p>
            </div>

            {/* Usability Window */}
            <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-2 text-xs font-bold text-emerald-200">
              <span>⏳ {resultData.estimatedUsabilityWindow}</span>
            </div>
          </div>

          {/* Key Findings Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#28382d] shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-[#14351d] dark:text-[#a8cfb4] tracking-wider">
              {t.keyFindingsHeader || "मुख्य दृश्य निरीक्षण (Key Findings)"}
            </h3>
            <ul className="space-y-2">
              {resultData.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#28382d] shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-[#14351d] dark:text-[#a8cfb4] tracking-wider">
              {t.recommendationsHeader || "किसान सलाह एवं सावधानियां"}
            </h3>
            <ul className="space-y-2">
              {resultData.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">
                  <span className="text-amber-600 font-bold shrink-0">💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-1 pb-2">
            <button
              onClick={() => navigate("/inspect/new")}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <span>{t.newScanActionBtn || "नई जाँच शुरू करें 📸"}</span>
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
