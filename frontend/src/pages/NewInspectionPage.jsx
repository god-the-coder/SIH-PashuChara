import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import { getActiveBatch, getBatchAgeDays } from "../utils/batchStore";

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
const FlipCameraIcon = () => (
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
  const activeBatch = getActiveBatch();
  const { t, showToast } = useDashboard();

  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState([null, null, null, null]);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [cameraStatus, setCameraStatus] = useState("idle"); // "idle" | "requesting" | "ready" | "error"
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [isFlashing, setIsFlashing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const isSilage = fodderType === "silage";

  const steps = [
    { id: "front",   title: t.step1Title || "Front View",      englishTitle: "Front View",    desc: t.step1Desc || "Show the full fodder stack or silage pit", hint: t.step1Hint || "Stand 3-4 feet away" },
    { id: "side",    title: t.step2Title || "Side Layers",     englishTitle: "Side Layers",   desc: t.step2Desc || "Show side layers and depth",              hint: t.step2Hint || "Show cut section depth" },
    { id: "macro",   title: t.step3Title || "Close-up",        englishTitle: "Close-up",      desc: t.step3Desc || "Show fine texture and moisture",          hint: t.step3Hint || "6-10 inches close" },
    { id: "storage", title: t.step4Title || "Storage",         englishTitle: "Storage",       desc: t.step4Desc || "Show shed floor and covering",            hint: t.step4Hint || "Show the full storage area" },
  ];

  const voiceMessages = [
    t.voiceStep1 || "Keep camera steady. Bring the full fodder stack into frame.",
    t.voiceStep2 || "Now capture the side layers and depth of the fodder.",
    t.voiceStep3 || "Bring camera 6-10 inches close to show fine texture.",
    t.voiceStep4 || "Now show the storage shed, floor, and covering.",
  ];

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
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
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
    } catch (err) {
      console.warn("Camera getUserMedia error:", err);
      setCameraStatus("error");
    }
  }, [cameraFacing]);

  // Start camera when entering an uncaptured step
  useEffect(() => {
    if (!capturedImages[currentStep]) {
      startCamera(cameraFacing);
    }
  }, [currentStep, capturedImages, startCamera, cameraFacing]);

  // Make sure video srcObject binds whenever video element renders
  useEffect(() => {
    if (videoRef.current && streamRef.current && !capturedImages[currentStep]) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const toggleFacingMode = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => saveStepImage(ev.target.result);
      reader.readAsDataURL(file);
    }
    // reset input so same file can be chosen again
    e.target.value = "";
  };

  const saveStepImage = (dataUrl) => {
    const updated = [...capturedImages];
    updated[currentStep] = dataUrl;
    setCapturedImages(updated);
    showToast((t.photoCapturedSuccess || "Photo saved") + " " + (currentStep + 1));
    if (currentStep < 3) setCurrentStep(s => s + 1);
  };

  const handleCameraCapture = () => {
    // If live video is active, snap photo directly from camera stream
    if (videoRef.current && cameraStatus === "ready" && videoRef.current.videoWidth > 0) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 180);
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
        saveStepImage(dataUrl);
        return;
      } catch (err) {
        console.warn("Canvas capture error, falling back to camera input:", err);
      }
    }
    // Fallback: dedicated camera capture
    cameraInputRef.current?.click();
  };

  const handleGalleryOpen = () => {
    galleryInputRef.current?.click();
  };

  const handleRetake = () => {
    const updated = [...capturedImages];
    updated[currentStep] = null;
    setCapturedImages(updated);
    showToast(t.photoRemovedToast || "Photo cleared");
    startCamera(cameraFacing);
  };

  const handleProceedToQuestions = () => {
    sessionStorage.setItem("pashuchaara_temp_images", JSON.stringify(capturedImages));
    sessionStorage.setItem("pashuchaara_temp_type", fodderType);
    navigate("/inspect/questions");
  };

  const allCaptured = capturedImages.every(img => img !== null);
  const capturedCount = capturedImages.filter(Boolean).length;
  const step = steps[currentStep];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#faf7f0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col bg-[#faf7f0] dark:bg-[#0a0c0b] shadow-2xl">

        <SubPageHeader
          title={isSilage ? (t.inspectSilageTitle || "Silage Inspection") : (t.inspectFeedTitle || "Feed Inspection")}
          subtitle={activeBatch ? `${activeBatch.id} · ${getBatchAgeDays(activeBatch)} days old` : "Photo " + (currentStep + 1) + " of 4"}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => setIsVoiceActive(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                isVoiceActive
                  ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                  : "bg-white dark:bg-[#181c18] border-gray-200 dark:border-gray-700 text-gray-400"
              }`}

            >
              <IcoMic />
              <span>{isVoiceActive ? "AI On" : "Muted"}</span>
            </button>
          }
        />

        <main className="flex-1 flex flex-col gap-3 px-4 pt-3 pb-4 overflow-y-auto">

          {activeBatch && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-[#102117]">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Inspecting existing batch</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                <div><span className="block text-[10px] text-gray-500">Batch ID</span><b>{activeBatch.id}</b></div>
                <div><span className="block text-[10px] text-gray-500">Batch type</span><b>{activeBatch.typeLabel || activeBatch.typeKey}</b></div>
                <div><span className="block text-[10px] text-gray-500">Age</span><b>{getBatchAgeDays(activeBatch)} days</b></div>
              </div>
            </section>
          )}

          {/* Step tab bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {steps.map((s, idx) => {
              const done = capturedImages[idx] !== null;
              const active = currentStep === idx;
              const Icon = STEP_ICONS[idx];
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`py-2 px-1 rounded-2xl text-center border text-[10px] font-bold cursor-pointer transition-all flex flex-col items-center gap-1 ${active ? "bg-white dark:bg-[#181d18] border-[#059652] text-[#059652] shadow-sm ring-1 ring-[#059652]/30" : done ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" : "bg-white dark:bg-[#141614] border-[#e8e2d8] dark:border-[#252525] text-gray-400 dark:text-gray-500"}`}
                >
                  <span className={done && !active ? "text-emerald-500" : active ? "text-[#059652]" : "text-gray-400 dark:text-gray-500"}>
                    {done && !active ? <IcoCheck /> : <Icon />}
                  </span>
                  <span className="font-semibold leading-tight">{s.englishTitle}</span>
                </button>
              );
            })}
          </div>

          {/* AI guidance */}
          {isVoiceActive && (
            <div className="p-3 rounded-2xl bg-white dark:bg-[#141914] border border-[#e5e0d8] dark:border-[#252825] flex items-start gap-2.5 shadow-sm">
              <IcoAI />
              <div>
                <p className="text-[11px] font-extrabold text-[#059652] dark:text-emerald-400 uppercase tracking-wide">{t.aiGuidanceLabel || "AI Guide"}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{voiceMessages[currentStep]}</p>
              </div>
            </div>
          )}

          {/* Camera viewfinder */}
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-[#0d120e] border border-[#2a302a] shadow-xl flex flex-col justify-between min-h-[260px]">
            {/* Step info overlay */}
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
              <p className="text-[11px] text-gray-200 leading-snug">{step.desc}</p>
              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-center gap-1.5">
                  <IcoTip />
                  <p className="text-[11px] text-amber-200 font-semibold">{step.hint}</p>
                </div>
                {!capturedImages[currentStep] && (
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all cursor-pointer"
                    title="Flip camera"
                  >
                    <FlipCameraIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Shutter flash effect */}
            {isFlashing && (
              <div className="absolute inset-0 z-30 bg-white/80 pointer-events-none transition-opacity duration-150" />
            )}

            {capturedImages[currentStep] ? (
              <div className="absolute inset-0 z-0">
                <img src={capturedImages[currentStep]} alt="Captured" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-emerald-500/30">
                  <IcoCheck />
                  <span className="text-[11px] text-emerald-300 font-bold">{t.photoCapturedBadge || "Captured"}</span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-black">
                {/* Live video feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraStatus === "ready" ? "opacity-100" : "opacity-0"}`}
                />

                {/* Framing guides */}
                {cameraStatus === "ready" && (
                  <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-emerald-400/40 rounded-lg" />
                  </div>
                )}

                {/* Loading state */}
                {cameraStatus === "requesting" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/70 text-white gap-2">
                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold">Opening camera...</p>
                  </div>
                )}

                {/* Error or Fallback state */}
                {cameraStatus === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#141814] text-white gap-2.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <IcoCamera />
                    </div>
                    <p className="text-xs font-bold text-gray-200 max-w-[220px]">Live stream unavailable</p>
                    <p className="text-[10px] text-gray-400 max-w-[220px]">Use camera button below to take photo directly</p>
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacing)}
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-emerald-300 cursor-pointer"
                    >
                      Retry Camera
                    </button>
                  </div>
                )}

                {/* Idle / Unstarted placeholder */}
                {cameraStatus === "idle" && (
                  <div className="w-44 h-36 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center">
                    <div className="text-white/25 scale-[2.5]">{(() => { const Icon = STEP_ICONS[currentStep]; return <Icon />; })()}</div>
                  </div>
                )}
              </div>
            )}

            {/* Progress pips */}
            <div className="relative z-10 flex items-center justify-center gap-1.5 mb-3">
              {steps.map((_, idx) => (
                <span key={idx} className={`rounded-full transition-all duration-300 ${idx === currentStep ? "w-5 h-1.5 bg-white" : capturedImages[idx] ? "w-1.5 h-1.5 bg-emerald-400" : "w-1.5 h-1.5 bg-white/25"}`} />
              ))}
            </div>

            {/* Dedicated Camera Input (Fallback) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            {/* Dedicated Gallery Input */}
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
              type="button"
              id="galleryBtn"
              onClick={handleGalleryOpen}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-white dark:bg-[#141614] border border-[#e8e2d8] dark:border-[#252525] text-gray-500 dark:text-gray-300 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#1a1c1a] shadow-sm active:scale-95"
            >
              <IcoGallery />
              <span className="text-[10px] font-semibold">{t.fromGalleryBtn || "Gallery"}</span>
            </button>

            <button
              type="button"
              id="shutterBtn"
              onClick={handleCameraCapture}
              aria-label="Take photo"
              className="w-16 h-16 rounded-full p-1 shadow-xl border-4 border-white dark:border-[#252525] flex items-center justify-center transition-transform active:scale-90 cursor-pointer hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #059652, #10b96a)" }}
            >
              <IcoCamera />
            </button>

            <button
              type="button"
              id="retakeBtn"
              onClick={handleRetake}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-white dark:bg-[#141614] border border-[#e8e2d8] dark:border-[#252525] text-gray-500 dark:text-gray-300 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#1a1c1a] shadow-sm active:scale-95"
            >
              <IcoRetake />
              <span className="text-[10px] font-semibold">{t.retakeBtn || "Retake"}</span>
            </button>
          </div>

          {/* Progress + proceed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-0.5">
              <span>{capturedCount}/4 photos captured</span>
              <span className="font-semibold text-[#059652]">{capturedCount * 25}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-[#1e201e] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: capturedCount * 25 + "%", background: "linear-gradient(90deg, #059652, #10b96a)" }} />
            </div>
            <button
              onClick={handleProceedToQuestions}
              disabled={!capturedImages[0]}
              className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${capturedImages[0] ? "text-white hover:brightness-110" : "bg-gray-100 dark:bg-[#1a1c1a] text-gray-400 cursor-not-allowed"}`}
              style={capturedImages[0] ? { background: "linear-gradient(135deg, #059652, #10b96a)" } : {}}
            >
              <span>{allCaptured ? (t.proceedToQuestionsBtn || "Answer Questions") : "Continue to Questions"}</span>
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
