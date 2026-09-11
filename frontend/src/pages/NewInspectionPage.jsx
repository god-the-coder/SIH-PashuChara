import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import inspectionService from "../services/inspection/inspectionService";
import SubPageHeader from "../components/layout/SubPageHeader";

const IMAGE_TYPES = ["FRONT_GENERAL", "SIDE_DEPTH", "MACRO", "STORAGE"];

const MATERIAL_TYPES = [
  { value: "GREEN_FODDER", label: "हरा चारा (Green Fodder)" },
  { value: "DRY_FODDER", label: "सूखा भूसा (Dry Fodder)" },
  { value: "SILAGE", label: "साइलेज (Silage)" },
  { value: "CONCENTRATE_FEED", label: "दाना मिश्रण (Concentrate Feed)" },
  { value: "OTHER", label: "अन्य (Other)" },
];

export default function NewInspectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fodderType = searchParams.get("type") || "silage";
  const batchId = searchParams.get("batchId");
  const { t, showToast } = useDashboard();

  const [inspectionId, setInspectionId] = useState(null);
  const [basicInfo, setBasicInfo] = useState({
    inspectionType: fodderType === "feed" ? "FEED" : "SILAGE",
    materialType: fodderType === "feed" ? "CONCENTRATE_FEED" : "SILAGE",
    materialTypeOther: "",
    storageDurationDays: "1",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState([null, null, null, null]);
  const [uploadingStep, setUploadingStep] = useState(null);
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

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (basicInfo.materialType === "OTHER" && !basicInfo.materialTypeOther.trim()) {
      setCreateError("कृपया चारे का प्रकार बताएं");
      return;
    }

    setIsCreating(true);
    try {
      const inspection = await inspectionService.create({
        inspectionType: basicInfo.inspectionType,
        materialType: basicInfo.materialType,
        materialTypeOther: basicInfo.materialTypeOther,
        storageDurationDays: Number(basicInfo.storageDurationDays) || 0,
        batchId: batchId ? Number(batchId) : undefined,
      });
      setInspectionId(inspection.id);
      sessionStorage.setItem("pashuchaara_inspection_id", String(inspection.id));
    } catch (apiError) {
      setCreateError(apiError.message || "जाँच शुरू नहीं हो सकी। कृपया पुनः प्रयास करें।");
    } finally {
      setIsCreating(false);
    }
  };

  const uploadStepImage = async (file) => {
    setUploadingStep(currentStep);
    try {
      const image = await inspectionService.uploadImage(inspectionId, file, IMAGE_TYPES[currentStep]);
      const updated = [...capturedImages];
      updated[currentStep] = { id: image.id, previewUrl: URL.createObjectURL(file) };
      setCapturedImages(updated);
      showToast(`तस्वीर ${currentStep + 1} सुरक्षित हो गई! ✓`);
      if (currentStep < 3) setCurrentStep((s) => s + 1);
    } catch (apiError) {
      showToast(apiError.message || "तस्वीर अपलोड नहीं हो सकी। पुनः प्रयास करें।");
    } finally {
      setUploadingStep(null);
    }
  };

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

    canvas.toBlob((blob) => {
      const file = new File([blob], `${steps[currentStep].id}.jpg`, { type: "image/jpeg" });
      uploadStepImage(file);
    }, "image/jpeg");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadStepImage(file);
  };

  const handleRetake = async () => {
    const existing = capturedImages[currentStep];
    if (!existing) return;

    try {
      await inspectionService.deleteImage(inspectionId, existing.id);
      URL.revokeObjectURL(existing.previewUrl);
      const updated = [...capturedImages];
      updated[currentStep] = null;
      setCapturedImages(updated);
      showToast("तस्वीर हटाई गई");
    } catch (apiError) {
      showToast(apiError.message || "तस्वीर हटाई नहीं जा सकी।");
    }
  };

  const handleProceedToQuestions = () => {
    navigate("/inspect/questions");
  };

  const allCaptured = capturedImages.every((img) => img !== null);
  const step = steps[currentStep];

  if (!inspectionId) {
    return (
      <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#121512] antialiased">
        <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-4 shadow-xl bg-[#FAF7F0] dark:bg-[#141814]">
          <SubPageHeader
            title="जाँच की मूल जानकारी"
            subtitle="चरण 1 / 2"
            backTo="/dashboard"
          />

          <form onSubmit={handleCreateInspection} className="my-3 space-y-3 flex-1">
            {batchId && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#1a3324] border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                📦 यह पुनः जाँच बैच #{batchId} से जुड़ेगी
              </div>
            )}
            <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
              <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
                जाँच का प्रकार
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "SILAGE", label: "साइलेज" },
                  { value: "FEED", label: "पशु आहार" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setBasicInfo({ ...basicInfo, inspectionType: opt.value })}
                    className={`py-2 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      basicInfo.inspectionType === opt.value
                        ? "bg-[#2D5A3D] text-white border-[#2D5A3D]"
                        : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
              <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
                चारे की सामग्री
              </label>
              <select
                value={basicInfo.materialType}
                onChange={(e) => setBasicInfo({ ...basicInfo, materialType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
              >
                {MATERIAL_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {basicInfo.materialType === "OTHER" && (
                <input
                  type="text"
                  placeholder="चारे का प्रकार लिखें"
                  value={basicInfo.materialTypeOther}
                  onChange={(e) => setBasicInfo({ ...basicInfo, materialTypeOther: e.target.value })}
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
                />
              )}
            </div>

            <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
              <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
                कितने दिनों से भंडारित है?
              </label>
              <input
                type="number"
                min="0"
                value={basicInfo.storageDurationDays}
                onChange={(e) => setBasicInfo({ ...basicInfo, storageDurationDays: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
              />
            </div>

            {createError && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{createError}</p>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <span>{isCreating ? "शुरू हो रहा है..." : "फोटो चरण पर जाएँ"}</span>
              <span className="text-sm">→</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#121512] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-4 shadow-xl bg-[#FAF7F0] dark:bg-[#141814]">
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

        <div className="relative my-2.5 flex-1 rounded-3xl overflow-hidden bg-stone-900 border-2 border-[#d5cbba] dark:border-[#354035] shadow-xl flex flex-col justify-between p-4 min-h-[290px]">
          <div className="relative z-10 p-3 rounded-2xl bg-black/65 backdrop-blur-md border border-white/20 text-left text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black">{step.title}</span>
              <span className="text-[10px] font-bold text-amber-300 uppercase">{step.englishTitle}</span>
            </div>
            <p className="text-xs text-gray-200 mt-1 leading-snug">{step.description}</p>
            <p className="text-[11px] text-emerald-300 mt-1 font-semibold">💡 {step.hint}</p>
          </div>

          {uploadingStep === currentStep ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-white text-xs font-bold">अपलोड हो रहा है...</span>
            </div>
          ) : capturedImages[currentStep] ? (
            <div className="absolute inset-0 z-0">
              <img
                src={capturedImages[currentStep].previewUrl}
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        <div className="pt-1 pb-2 space-y-3">
          <div className="flex items-center justify-around gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingStep !== null}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1b221b] hover:bg-gray-50 border border-[#ded5c4] dark:border-[#2b382b] text-xs font-bold text-gray-700 dark:text-gray-200 flex flex-col items-center gap-0.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <span className="text-base">📁</span>
              <span className="text-[10px]">{t.fromGalleryBtn || "गैलरी से"}</span>
            </button>

            <button
              id="shutterBtn"
              onClick={handleCaptureSimulated}
              disabled={uploadingStep !== null}
              className="w-16 h-16 rounded-full bg-white dark:bg-[#202720] p-1.5 shadow-xl border-4 border-[#2D5A3D] dark:border-emerald-500 flex items-center justify-center transition-transform active:scale-90 cursor-pointer disabled:opacity-60"
            >
              <div className="w-full h-full rounded-full bg-[#2D5A3D] text-white flex items-center justify-center text-xl font-black">
                📷
              </div>
            </button>

            <button
              onClick={handleRetake}
              disabled={uploadingStep !== null || !capturedImages[currentStep]}
              className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1b221b] hover:bg-gray-50 border border-[#ded5c4] dark:border-[#2b382b] text-xs font-bold text-gray-700 dark:text-gray-200 flex flex-col items-center gap-0.5 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <span className="text-base">🔄</span>
              <span className="text-[10px]">{t.retakeBtn || "दोबारा"}</span>
            </button>
          </div>

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
