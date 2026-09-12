import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import inspectionService from "../services/inspection/inspectionService";
import SubPageHeader from "../components/layout/SubPageHeader";

const IMAGE_TYPES = ["FRONT_GENERAL", "SIDE_DEPTH", "MACRO", "STORAGE"];

const IcoPlant = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);
const IcoLayers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
  </svg>
);
const IcoMacro = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0zM10.5 7.5v6m3-3h-6" />
  </svg>
);
const IcoStorage = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);
const IcoCamera = () => (
  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);
const IcoGallery = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const IcoRetake = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const IcoFlipCamera = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const IcoMic = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);
const IcoAI = () => (
  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);
const IcoCheck = () => (
  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const IcoTip = () => (
  <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const STEP_ICONS = [IcoPlant, IcoLayers, IcoMacro, IcoStorage];

export default function NewInspectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fodderType = searchParams.get("type") || "silage";
  const batchId = searchParams.get("batchId");
  const { t, showToast } = useDashboard();

  const MATERIAL_TYPES = [
    { value: "GREEN_FODDER", label: t.matLabelGreenFodder },
    { value: "DRY_FODDER", label: t.matLabelDryFodder },
    { value: "SILAGE", label: t.matLabelSilage },
    { value: "CONCENTRATE_FEED", label: t.matLabelConcentrateFeed },
    { value: "OTHER", label: t.matLabelOther },
  ];

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
  const [cameraStatus, setCameraStatus] = useState("idle"); // "idle" | "requesting" | "ready" | "error"
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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

  const voiceGuidanceMessages = [t.voiceStep1, t.voiceStep2, t.voiceStep3, t.voiceStep4];

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (basicInfo.materialType === "OTHER" && !basicInfo.materialTypeOther.trim()) {
      setCreateError(t.errMaterialTypeOther);
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
      setCreateError(apiError.message || t.errInspectionCreateFailed);
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
      showToast(t.photoSavedToast.replace("{n}", currentStep + 1));
      if (currentStep < 3) setCurrentStep((s) => s + 1);
    } catch (apiError) {
      showToast(apiError.message || t.errPhotoUploadFailed);
    } finally {
      setUploadingStep(null);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("idle");
  }, []);

  const startCamera = useCallback(async (facing = cameraFacing) => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      return;
    }
    setCameraStatus("requesting");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
      setCameraStatus("ready");
    } catch {
      setCameraStatus("error");
    }
  }, [cameraFacing]);

  // Start the live camera feed whenever we land on a step that has no photo yet.
  // startCamera talks to a real external system (getUserMedia) and sets a
  // "requesting" status as the very first thing it does — that's the effect
  // syncing React with the camera, not a computed-state anti-pattern.
  useEffect(() => {
    if (!inspectionId || capturedImages[currentStep]) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera(cameraFacing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectionId, currentStep, capturedImages[currentStep]]);

  // Re-bind the stream whenever the <video> element itself remounts (e.g. after
  // switching away from and back to an uncaptured step).
  useEffect(() => {
    if (videoRef.current && streamRef.current && !capturedImages[currentStep]) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  });

  useEffect(() => () => stopCamera(), [stopCamera]);

  const toggleFacingMode = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const handleCameraCapture = () => {
    // Live stream is the real path: snap the current video frame.
    if (videoRef.current && cameraStatus === "ready" && videoRef.current.videoWidth > 0) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 180);
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          const file = new File([blob], `${steps[currentStep].id}.jpg`, { type: "image/jpeg" });
          uploadStepImage(file);
        }, "image/jpeg", 0.88);
        return;
      } catch {
        // fall through to the native camera-input fallback below
      }
    }
    // Fallback for browsers without getUserMedia (or a denied/unready stream):
    // a native camera-capture file input, kept distinct from the gallery picker.
    cameraInputRef.current?.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadStepImage(file);
    e.target.value = "";
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
      showToast(t.photoRemovedToast);
      startCamera(cameraFacing);
    } catch (apiError) {
      showToast(apiError.message || t.errPhotoDeleteFailed);
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
            title={t.basicInfoTitle}
            subtitle={t.basicInfoStepIndicator}
            backTo="/dashboard"
          />

          <form onSubmit={handleCreateInspection} className="my-3 space-y-3 flex-1">
            {batchId && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#1a3324] border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {t.reinspectBatchNotice.replace("{id}", batchId)}
              </div>
            )}
            <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
              <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
                {t.inspectionTypeLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "SILAGE", label: t.typeSilage },
                  { value: "FEED", label: t.typeFeed },
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
                {t.materialTypeLabel}
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
                  placeholder={t.materialTypeOtherPlaceholder}
                  value={basicInfo.materialTypeOther}
                  onChange={(e) => setBasicInfo({ ...basicInfo, materialTypeOther: e.target.value })}
                  className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
                />
              )}
            </div>

            <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
              <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
                {t.storageDurationLabel}
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
              <span>{isCreating ? t.startingBtn : t.proceedToPhotoBtn}</span>
              <span className="text-sm">→</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const capturedCount = capturedImages.filter(Boolean).length;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#faf7f0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col bg-[#faf7f0] dark:bg-[#0a0c0b] shadow-2xl">
        <SubPageHeader
          title={fodderType === "silage" ? (t.inspectSilageTitle || "साइलेज दृश्य जाँच") : (t.inspectFeedTitle || "पशु आहार दृश्य जाँच")}
          subtitle={`${t.stepPrefix || "चरण"} ${currentStep + 1} / 4`}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => setIsVoiceActive((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                isVoiceActive
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                  : "bg-white dark:bg-[#181c18] border-gray-200 dark:border-gray-700 text-gray-400"
              }`}
            >
              <IcoMic />
              <span>{isVoiceActive ? (t.voiceActivePill || "🎙️ चालू") : (t.voiceInactivePill || "🔇 बंद")}</span>
            </button>
          }
        />

        <main className="flex-1 flex flex-col gap-3 px-4 pt-3 pb-4 overflow-y-auto">
          {/* Step tab bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {steps.map((s, idx) => {
              const done = Boolean(capturedImages[idx]);
              const active = currentStep === idx;
              const Icon = STEP_ICONS[idx];
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`py-2 px-1 rounded-2xl text-center border text-[10px] font-bold cursor-pointer transition-all flex flex-col items-center gap-1 ${
                    active
                      ? "bg-white dark:bg-[#181d18] border-[#059652] text-[#059652] shadow-sm ring-1 ring-[#059652]/30"
                      : done
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      : "bg-white dark:bg-[#141614] border-[#e8e2d8] dark:border-[#252525] text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <span className={done && !active ? "text-emerald-500" : active ? "text-[#059652]" : "text-gray-400 dark:text-gray-500"}>
                    {done && !active ? <IcoCheck /> : <Icon />}
                  </span>
                  <span className="font-semibold leading-tight truncate">{s.englishTitle}</span>
                </button>
              );
            })}
          </div>

          {/* AI guidance */}
          {isVoiceActive && (
            <div className="p-3 rounded-2xl bg-white dark:bg-[#141914] border border-[#e5e0d8] dark:border-[#252825] flex items-start gap-2.5 shadow-sm">
              <IcoAI />
              <div>
                <p className="text-[11px] font-extrabold text-[#059652] dark:text-emerald-400 uppercase tracking-wide">
                  {t.aiGuidanceLabel || "लाइव सहायक सुझाव:"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                  {voiceGuidanceMessages[currentStep]}
                </p>
              </div>
            </div>
          )}

          {/* Camera viewfinder */}
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#0d120e] border border-[#2a302a] shadow-xl flex flex-col justify-between min-h-[290px]">
            {!capturedImages[currentStep] && cameraStatus === "ready" && (
              <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" />
            )}
            {isFlashing && <div className="absolute inset-0 z-20 bg-white animate-pulse" />}

            <div className="relative z-10 m-3 p-3 rounded-xl bg-black/60 backdrop-blur-sm text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black">{step.title}</span>
                <div className="flex items-center gap-2">
                  {!capturedImages[currentStep] && cameraStatus === "ready" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">{step.englishTitle}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-200 leading-snug">{step.description}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <IcoTip />
                <p className="text-[11px] text-amber-200 font-semibold">{step.hint}</p>
              </div>
            </div>

            {!capturedImages[currentStep] && cameraStatus === "ready" && (
              <button
                onClick={toggleFacingMode}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer active:scale-90"
              >
                <IcoFlipCamera />
              </button>
            )}

            {uploadingStep === currentStep ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                <span className="text-white text-xs font-bold">{t.uploadingText}</span>
              </div>
            ) : capturedImages[currentStep] ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={capturedImages[currentStep].previewUrl}
                  alt="Captured sample"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-emerald-500/30">
                  <IcoCheck />
                  <span className="text-[11px] text-emerald-300 font-bold">{t.photoCapturedBadge || "फोटो दर्ज हो चुकी है"}</span>
                </div>
              </div>
            ) : cameraStatus !== "ready" ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-36 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                  <div className="text-white/25 scale-[2.5]">
                    {(() => { const Icon = STEP_ICONS[currentStep]; return <Icon />; })()}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Progress pips */}
            <div className="relative z-10 flex items-center justify-center gap-1.5 mb-3">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentStep ? "w-5 h-1.5 bg-white" : capturedImages[idx] ? "w-1.5 h-1.5 bg-emerald-400" : "w-1.5 h-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>

            {/* Fallback for browsers without getUserMedia support */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Shutter controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingStep !== null}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-white dark:bg-[#141614] border border-[#e8e2d8] dark:border-[#252525] text-gray-500 dark:text-gray-300 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#1a1c1a] shadow-sm disabled:opacity-60"
            >
              <IcoGallery />
              <span className="text-[10px] font-semibold">{t.fromGalleryBtn || "गैलरी से"}</span>
            </button>

            <button
              id="shutterBtn"
              onClick={handleCameraCapture}
              disabled={uploadingStep !== null}
              className="w-16 h-16 rounded-full p-1 shadow-xl border-4 border-white dark:border-[#252525] flex items-center justify-center transition-transform active:scale-90 cursor-pointer disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #059652, #10b96a)" }}
            >
              <IcoCamera />
            </button>

            <button
              onClick={handleRetake}
              disabled={uploadingStep !== null || !capturedImages[currentStep]}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-white dark:bg-[#141614] border border-[#e8e2d8] dark:border-[#252525] text-gray-500 dark:text-gray-300 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#1a1c1a] shadow-sm disabled:opacity-60"
            >
              <IcoRetake />
              <span className="text-[10px] font-semibold">{t.retakeBtn || "दोबारा"}</span>
            </button>
          </div>

          {/* Progress + proceed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-0.5">
              <span>{capturedCount}/4 {t.photosCapturedLabel || "photos captured"}</span>
              <span className="font-semibold text-[#059652]">{capturedCount * 25}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-[#1e201e] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: capturedCount * 25 + "%", background: "linear-gradient(90deg, #059652, #10b96a)" }}
              />
            </div>
            <button
              onClick={handleProceedToQuestions}
              disabled={!capturedImages[0]}
              className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                capturedImages[0] ? "text-white hover:brightness-110" : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
              style={capturedImages[0] ? { background: "linear-gradient(135deg, #059652, #10b96a)" } : {}}
            >
              <span>{allCaptured ? (t.proceedToQuestionsBtn || "सवालों के जवाब दें") : (t.proceedToQuestionsBtn || "आगे के सवालों पर चलें")}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
