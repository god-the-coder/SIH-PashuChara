import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function NewInspectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fodderType = searchParams.get("type") || "silage";
  const { t, showToast } = useDashboard();

  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState([null, null, null, null]);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const fileInputRef = useRef(null);

  const steps = [
    {
      id: "front",
      title: t.step1Title || "सामने से मुख्य दृश्य",
      englishTitle: "Front Overview",
      description: t.step1Desc || "पूरे चारे का ढेर या साइलेज गड्ढा स्क्रीन में दिखना चाहिए।",
      hint: t.step1Hint || "ढेर से 3-4 फीट दूर खड़े होकर पूरे चारे का आकार व रंग दिखाएँ।",
      icon: "🌾",
    },
    {
      id: "side",
      title: t.step2Title || "साइड दृश्य / परतें",
      englishTitle: "Side Layers",
      description: t.step2Desc || "चारे के अलग-अलग हिस्सों व परतों की स्थिति देखने के लिए।",
      hint: t.step2Hint || "किनारे या कटे हुए हिस्से से गहराई व हवा के संपर्क की परत दिखाएँ।",
      icon: "📐",
    },
    {
      id: "macro",
      title: t.step3Title || "नज़दीक से बनावट",
      englishTitle: "Macro Texture",
      description: t.step3Desc || "चारे की पास से बारीक बनावट, पत्तियाँ और नमी देखने के लिए।",
      hint: t.step3Hint || "कैमरा 6-10 इंच पास लाएँ। हाथ में चारा पकड़कर फफूंद के बारीक रेशे दिखाएँ।",
      icon: "🔍",
    },
    {
      id: "storage",
      title: t.step4Title || "भंडारण परिवेश",
      englishTitle: "Storage Environment",
      description: t.step4Desc || "शेड, फर्श, तिरपाल, छत व सुरक्षा स्थिति देखने के लिए।",
      hint: t.step4Hint || "जहाँ चारा रखा है उस जगह की जमीन, छत व सीलन की तस्वीर लें।",
      icon: "🏚️",
    },
  ];

  const voiceGuidanceMessages = [
    "कैमरा स्थिर रखें किसान जी, पूरे चारे का ढेर स्क्रीन में लाएँ।",
    "बहुत अच्छा, अब चारे के किनारे या साइड की परतों की फोटो लें।",
    "कैमरा थोड़ा पास लाएँ, चारे की बारीक बनावट साफ दिखनी चाहिए।",
    "अब जहाँ चारा रखा है, उस शेड या फर्श का परिवेश दिखाएँ।",
  ];

  const handleCaptureSimulated = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = currentStep === 3 ? "#8d7960" : currentStep === 2 ? "#4f6e52" : "#3b5840";
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${steps[currentStep].title}`, 200, 150);

    const dataUrl = canvas.toDataURL("image/jpeg");
    saveStepImage(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        saveStepImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveStepImage = (dataUrl) => {
    const updated = [...capturedImages];
    updated[currentStep] = dataUrl;
    setCapturedImages(updated);
    showToast(`तस्वीर ${currentStep + 1} सुरक्षित हो गई! ✓`);

    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleProceedToQuestions = () => {
    sessionStorage.setItem("pashuchaara_temp_images", JSON.stringify(capturedImages));
    sessionStorage.setItem("pashuchaara_temp_type", fodderType);
    navigate("/inspect/questions");
  };

  const allCaptured = capturedImages.every((img) => img !== null);
  const step = steps[currentStep];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#121512] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-4 shadow-xl bg-[#FAF7F0] dark:bg-[#141814]">
        {/* SubPageHeader with language switcher */}
        <SubPageHeader
          title={fodderType === "silage" ? (t.inspectSilageTitle || "साइलेज दृश्य जाँच") : (t.inspectFeedTitle || "पशु आहार दृश्य जाँच")}
          subtitle={`${t.stepPrefix || "चरण"} ${currentStep + 1} / 4`}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => setIsVoiceActive((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${
                isVoiceActive
                  ? "bg-white dark:bg-[#1d261f] border-[#ded5c2] dark:border-[#2b382e] text-[#2D5A3D] dark:text-emerald-300"
                  : "bg-white dark:bg-[#181c18] border-gray-200 dark:border-gray-800 text-gray-400"
              }`}
            >
              {isVoiceActive ? (t.voiceActivePill || "🎙️ चालू") : (t.voiceInactivePill || "🔇 बंद")}
            </button>
          }
        />

        {/* Step Indicator Badges - Clean Sandish / Off-white Cards */}
        <div className="grid grid-cols-4 gap-1.5 my-2.5">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`py-2 px-1 rounded-2xl text-center border text-[10px] font-bold cursor-pointer transition-all shadow-xs ${
                currentStep === idx
                  ? "bg-white dark:bg-[#202720] border-[#2D5A3D] dark:border-emerald-500 text-[#2D5A3D] dark:text-white ring-1 ring-[#2D5A3D]"
                  : capturedImages[idx]
                  ? "bg-[#ede7da] dark:bg-[#1a211a] border-[#d8cfbf] dark:border-[#2d382d] text-emerald-900 dark:text-emerald-300 font-bold"
                  : "bg-white dark:bg-[#161a16] border-[#e8e2d6] dark:border-[#252c25] text-gray-600 dark:text-gray-400"
              }`}
            >
              <div>{s.icon} {idx + 1}</div>
              <div className="truncate font-semibold">{s.englishTitle}</div>
            </button>
          ))}
        </div>

        {/* Live Audio / AI Guidance Pill - Muted Sandy Card */}
        {isVoiceActive && (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#192119] border border-[#ded5c4] dark:border-[#2b382b] flex items-start gap-2.5 shadow-xs">
            <span className="text-lg">🤖</span>
            <div className="text-xs">
              <span className="font-extrabold text-[#2D5A3D] dark:text-[#86efac]">
                {t.aiGuidanceLabel || "लाइव सहायक सुझाव:"}
              </span>
              <p className="text-gray-700 dark:text-gray-300 mt-0.5 leading-snug">
                {voiceGuidanceMessages[currentStep]}
              </p>
            </div>
          </div>
        )}

        {/* Camera Viewfinder Screen - Neutral Sand & Slate Frame */}
        <div className="relative my-2.5 flex-1 rounded-3xl overflow-hidden bg-stone-900 border-2 border-[#d5cbba] dark:border-[#354035] shadow-xl flex flex-col justify-between p-4 min-h-[290px]">
          {/* Active step guide banner */}
          <div className="relative z-10 p-3 rounded-2xl bg-black/65 backdrop-blur-md border border-white/20 text-left text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black">{step.title}</span>
              <span className="text-[10px] font-bold text-amber-300 uppercase">{step.englishTitle}</span>
            </div>
            <p className="text-xs text-gray-200 mt-1 leading-snug">{step.description}</p>
            <p className="text-[11px] text-emerald-300 mt-1 font-semibold">💡 {step.hint}</p>
          </div>

          {/* Captured Preview or Viewfinder Crosshairs */}
          {capturedImages[currentStep] ? (
            <div className="absolute inset-0 z-0">
              <img
                src={capturedImages[currentStep]}
                alt="Captured sample"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/75 px-3 py-1 rounded-xl text-xs text-emerald-300 font-bold border border-emerald-500/30">
                {t.photoCapturedBadge || "✓ फोटो दर्ज हो चुकी है"}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-dashed border-white/40 rounded-3xl flex items-center justify-center">
                <span className="text-4xl opacity-50">{step.icon}</span>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Bottom Shutter & Controls - Warm Sandish Neutral Bar */}
        <div className="pt-1 pb-2 space-y-3">
          <div className="flex items-center justify-around gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1b221b] hover:bg-gray-50 border border-[#ded5c4] dark:border-[#2b382b] text-xs font-bold text-gray-700 dark:text-gray-200 flex flex-col items-center gap-0.5 cursor-pointer shadow-xs"
            >
              <span className="text-base">📁</span>
              <span className="text-[10px]">{t.fromGalleryBtn || "गैलरी से"}</span>
            </button>

            {/* Shutter Button */}
            <button
              id="shutterBtn"
              onClick={handleCaptureSimulated}
              className="w-16 h-16 rounded-full bg-white dark:bg-[#202720] p-1.5 shadow-xl border-4 border-[#2D5A3D] dark:border-emerald-500 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-[#2D5A3D] text-white flex items-center justify-center text-xl font-black">
                📷
              </div>
            </button>

            <button
              onClick={() => {
                const updated = [...capturedImages];
                updated[currentStep] = null;
                setCapturedImages(updated);
                showToast("तस्वीर हटाई गई");
              }}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1b221b] hover:bg-gray-50 border border-[#ded5c4] dark:border-[#2b382b] text-xs font-bold text-gray-700 dark:text-gray-200 flex flex-col items-center gap-0.5 cursor-pointer shadow-xs"
            >
              <span className="text-base">🔄</span>
              <span className="text-[10px]">{t.retakeBtn || "दोबारा"}</span>
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleProceedToQuestions}
            disabled={!capturedImages[0]}
            className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              capturedImages[0]
                ? "bg-[#2D5A3D] hover:bg-[#1E442B] text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>{allCaptured ? (t.proceedToQuestionsBtn || "सवालों के जवाब दें") : (t.proceedToQuestionsBtn || "आगे के सवालों पर चलें")}</span>
            <span className="text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
