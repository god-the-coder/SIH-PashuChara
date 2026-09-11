import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function InspectionQuestionnairePage() {
  const navigate = useNavigate();
  const { t, showToast } = useDashboard();

  const [formData, setFormData] = useState({
    fodderType: "मक्का साइलेज",
    storageDuration: "1-3 दिन",
    covered: "हाँ (तिरपाल/शेड से ढका है)",
    badSmell: "सामान्य/मीठी गंध (Normal)",
    dailyUsage: "तुरंत दुधारू पशुओं को खिलाना है",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    sessionStorage.setItem("pashuchaara_temp_answers", JSON.stringify(formData));

    // Simulate AI diagnostic pipeline
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/results/latest");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#121512] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-4 shadow-xl bg-[#FAF7F0] dark:bg-[#141814]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.qPageTitle || "चारे की स्थिति की जानकारी"}
          subtitle={t.qPageSub || "सटीक AI रिपोर्ट के लिए उत्तर दें"}
          backTo={-1}
          actionBtn={
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1c271e] border border-[#ded5c2] dark:border-[#2a3c2c] text-[11px] font-bold text-[#2D5A3D] dark:text-[#86efac]">
              {t.stepIndicatorQuestions || "चरण 2/2"}
            </span>
          }
        />

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/30 flex items-center justify-center text-2xl animate-spin mb-3">
              🔬
            </div>
            <h3 className="text-base font-black text-white">
              {t.analyzingFodderTitle || "चारे का AI विश्लेषण हो रहा है..."}
            </h3>
            <p className="text-xs text-gray-300 mt-1.5 max-w-xs leading-relaxed">
              {t.analyzingFodderSub || "4 तस्वीरों के दृश्य लक्षण, रंग, नमी और आपके उत्तरों के आधार पर फफूंद जोखिम जांची जा रही है।"}
            </p>
          </div>
        )}

        {/* Form Fields - Clean Sandish Off-White Cards */}
        <form onSubmit={handleSubmit} className="my-3 space-y-3 flex-1 overflow-y-auto pr-0.5">
          {/* Fodder type */}
          <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
            <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
              {t.q1Label || "1. चारे का प्रकार क्या है?"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["मक्का साइलेज", "हरा चारा", "सूखा भूसा"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setFormData({ ...formData, fodderType: item })}
                  className={`py-2 px-1 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.fodderType === item
                      ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                      : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Storage duration */}
          <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
            <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
              {t.q2Label || "2. यह कितने समय से रखा है?"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["आज काटा (Fresh)", "1-3 दिन", "4-7 दिन", "1 सप्ताह से अधिक"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setFormData({ ...formData, storageDuration: item })}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.storageDuration === item
                      ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                      : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Tarp / Covered */}
          <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
            <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
              {t.q3Label || "3. क्या यह तिरपाल या शेड से सुरक्षित है?"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "हाँ, पूरी तरह ढका है", val: "हाँ (तिरपाल/शेड से ढका है)" },
                { label: "नहीं, खुला पड़ा है", val: "खुला (बिना सुरक्षा)" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setFormData({ ...formData, covered: opt.val })}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.covered === opt.val
                      ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                      : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smell / Odor */}
          <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
            <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
              {t.q4Label || "4. चारे की महक कैसी है?"}
            </label>
            <div className="space-y-2">
              {[
                { label: "सुखद, खट्टी-मीठी (सामान्य साइलेज गंध)", val: "सामान्य/मीठी गंध (Normal)" },
                { label: "अत्यधिक तीखी या सिरके जैसी", val: "तीखी सिरका गंध" },
                { label: "सड़ी हुई, दुर्गंध या फफूंद गंध", val: "सड़न या दुर्गंध" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setFormData({ ...formData, badSmell: opt.val })}
                  className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold border text-left transition-all cursor-pointer flex items-center justify-between ${
                    formData.badSmell === opt.val
                      ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                      : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                  }`}
                >
                  <span>{opt.label}</span>
                  {formData.badSmell === opt.val && <span className="font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Feeding timeframe */}
          <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
            <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
              {t.q5Label || "5. इसका उपयोग कब करना है?"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "आज ही खिलाना है", val: "तुरंत दुधारू पशुओं को खिलाना है" },
                { label: "भंडारित रखना है", val: "बाद में खिलाने हेतु रखा है" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setFormData({ ...formData, dailyUsage: opt.val })}
                  className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.dailyUsage === opt.val
                      ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                      : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-1 pb-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
            >
              <span>{t.btnAnalyzeFodder || "AI गुणवत्ता विश्लेषण प्रारंभ करें"}</span>
              <span className="text-sm">✨</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
