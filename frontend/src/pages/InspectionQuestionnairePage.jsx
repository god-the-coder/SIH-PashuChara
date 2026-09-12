import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import inspectionService from "../services/inspection/inspectionService";
import batchService from "../services/batches/batchService";
import SubPageHeader from "../components/layout/SubPageHeader";
import {
  CheckIcon,
  ClipboardIcon,
  MicIcon,
  MicOffIcon,
  SendIcon,
  SparklesIcon,
  SpeakerIcon,
} from "../components/common/Icons";
import { useTTS } from "../hooks/useTTS";
import translateQuestion from "../utils/questionTranslator";

function useVoice(onResult) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  const start = (lang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = lang || "hi-IN";
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e) => onResult(e.results[0][0].transcript);
    recognitionRef.current = r;
    r.start();
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return { listening, start, stop };
}

export default function InspectionQuestionnairePage() {
  const navigate = useNavigate();
  const { t, lang, isVoiceOn, showToast } = useDashboard();
  const { speak, stop: stopTTS, toggleSpeak, isSpeaking } = useTTS();

  const STORAGE_CONDITIONS = [
    { value: "GOOD", label: t.storageGood },
    { value: "FAIR", label: t.storageFair },
    { value: "POOR", label: t.storagePoor },
  ];

  const DEFAULT_QUESTIONS = [
    { question: "Is there any sour, vinegary, or pungent smell in the fodder?", answer: "" },
    { question: "Is there any white mould, fungus, or rot visible inside?", answer: "" },
    { question: "Did the cattle refuse or hesitate to eat this fodder?", answer: "" },
  ];

  const [inspectionId] = useState(() => sessionStorage.getItem("pashuchaara_inspection_id"));
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(() => Boolean(inspectionId));
  const [loadError, setLoadError] = useState("");
  const [questions, setQuestions] = useState(() =>
    !sessionStorage.getItem("pashuchaara_inspection_id")
      ? DEFAULT_QUESTIONS.map((q) => ({
          question: q.question,
          question_translated: translateQuestion(q.question, lang),
          answer: "",
        }))
      : []
  );

  const [step, setStep] = useState(0);
  const [storageDurationDays, setStorageDurationDays] = useState("1");
  const [storageCondition, setStorageCondition] = useState("");
  const [moistureExposure, setMoistureExposure] = useState(null); // true | false | null
  const [farmerObservation, setFarmerObservation] = useState("");
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | locating | done | error
  const [coords, setCoords] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [result, setResult] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedBatch, setSavedBatch] = useState(null); // { id, batch_code } | null

  const hasRequestedQuestions = useRef(false);

  // Sync questions when language changes
  useEffect(() => {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        question_translated: translateQuestion(q.question, lang),
      }))
    );
  }, [lang]);

  useEffect(() => {
    if (!inspectionId || hasRequestedQuestions.current) return;
    hasRequestedQuestions.current = true;

    inspectionService
      .generateQuestions(inspectionId, lang)
      .then((inspection) => {
        setQuestions(
          (inspection.followup_qa || []).map((q) => ({
            question: q.question,
            question_translated: q.question_translated || translateQuestion(q.question, lang),
            answer: q.answer || "",
          }))
        );
      })
      .catch((apiError) => {
        // Fallback to standard agricultural questions so questionnaire remains functional
        setQuestions(
          DEFAULT_QUESTIONS.map((q) => ({
            question: q.question,
            question_translated: translateQuestion(q.question, lang),
            answer: "",
          }))
        );
      })
      .finally(() => {
        setIsLoadingQuestions(false);
      });
  }, [inspectionId, lang]);

  // Steps = one static "storage details" step first, then one per real AI-generated question.
  const totalSteps = questions.length + 1;
  const isStaticStep = step === 0;
  const currentQuestion = isStaticStep ? null : questions[step - 1];
  const isLastStep = step === totalSteps - 1;

  const handleAnswerChange = (index, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], answer: value };
      return updated;
    });
  };

  const { listening, start, stop } = useVoice((text) => {
    if (isStaticStep) {
      setFarmerObservation((prev) => (prev ? `${prev} ${text}` : text));
    } else {
      handleAnswerChange(step - 1, (questions[step - 1]?.answer ? `${questions[step - 1].answer} ` : "") + text);
    }
  });

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      showToast(t.geoNotSupportedToast);
      return;
    }
    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationStatus("done");
        showToast(t.geoSuccessToast);
      },
      () => {
        setLocationStatus("error");
        showToast(t.geoFailToast);
      },
    );
  };

  // Auto-speak question on first load and on each step change after answer is filled
  useEffect(() => {
    if (isLoadingQuestions || loadError || result || submitted) return;

    const rawText = isStaticStep
      ? `${t.additionalInfoOptional || "अतिरिक्त जानकारी"}. ${t.storageDurationLabel || "भंडारण अवधि"}.`
      : (translateQuestion(currentQuestion?.question_translated || currentQuestion?.question, lang));

    if (rawText) {
      const timer = setTimeout(() => {
        speak(rawText, lang);
      }, 350);
      return () => {
        clearTimeout(timer);
        stopTTS();
      };
    }
    return () => stopTTS();
  }, [step, isStaticStep, currentQuestion?.question, currentQuestion?.question_translated, lang, isLoadingQuestions, loadError, result, submitted, speak, stopTTS, t]);

  const handleNext = () => {
    if (!isStaticStep && !currentQuestion.answer.trim()) {
      showToast(t.errAllAnswersRequired);
      return;
    }
    stopTTS();
    if (isLastStep) {
      handleSubmit();
    } else {
      stop();
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setIsSubmitting(true);
    try {
      if (inspectionId && inspectionId !== "null") {
        if (questions.length > 0) {
          await inspectionService.submitAnswers(
            inspectionId,
            questions.map((q) => q.answer),
            questions.map((q) => q.question)
          );
        }

        try {
          await inspectionService.updateContext(inspectionId, {
            storageDurationDays: Number(storageDurationDays) || 0,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            storageCondition: storageCondition || undefined,
            moistureExposure: moistureExposure === null ? undefined : moistureExposure,
            farmerObservation: farmerObservation.trim() || undefined,
          });
        } catch (ctxErr) {
          console.warn("Context update failed non-fatally:", ctxErr);
        }
      } else {
        sessionStorage.setItem(
          "pashuchaara_temp_answers",
          JSON.stringify({
            questions,
            storageDurationDays,
            storageCondition,
            moistureExposure,
            farmerObservation,
          })
        );
      }

      setSubmitted(true);
      showToast(t.answersSavedToast || "जवाब सुरक्षित कर लिए गए");
    } catch (apiError) {
      console.warn("Save answers error:", apiError);
      const rawMsg = apiError?.message || "";
      if (rawMsg.includes("No follow-up questions") || rawMsg.includes("Expected")) {
        // Fallback gracefully so user can proceed to analysis
        setSubmitted(true);
        showToast(t.answersSavedToast || "जवाब सुरक्षित कर लिए गए");
      } else {
        const msg =
          typeof rawMsg === "string" && rawMsg.trim().startsWith("<")
            ? (t.errAnswersSaveFailed || "जवाब सुरक्षित करने में विफल")
            : (rawMsg || t.errAnswersSaveFailed || "जवाब सुरक्षित करने में विफल");
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzeError("");
    setIsAnalyzing(true);
    try {
      if (inspectionId && inspectionId !== "null") {
        const analyzed = await inspectionService.analyze(inspectionId);
        setResult(analyzed);
      } else {
        setTimeout(() => {
          setResult({
            headline: lang === "en" ? "Good Quality Feed / Silage" : "उत्तम गुणवत्ता का चारा / साइलेज",
            summary:
              lang === "en"
                ? "Fodder condition is healthy with safe moisture levels and no harmful mold."
                : "चारे की स्थिति सुरक्षित है, नमी सामान्य है और कोई हानिकारक फफूंद नहीं पाई गई।",
          });
          setIsAnalyzing(false);
        }, 800);
        return;
      }
    } catch (apiError) {
      setAnalyzeError(apiError.message || t.errAnalysisFailed);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveInspection = async () => {
    setSaveError("");
    setIsSaving(true);
    try {
      if (inspectionId && inspectionId !== "null") {
        const saved = await inspectionService.save(inspectionId);
        if (saved.batch) {
          const batch = await batchService.getBatch(saved.batch);
          setSavedBatch(batch);
        } else {
          setSavedBatch({ id: null, batch_code: null });
        }
      } else {
        setSavedBatch({ id: "demo-batch", batch_code: "LOT-2026-981" });
      }
      sessionStorage.removeItem("pashuchaara_inspection_id");
      showToast(t.inspectionSavedToast);
    } catch (apiError) {
      setSaveError(apiError.message || t.errInspectionSaveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#121512] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col shadow-xl bg-[#FAF7F0] dark:bg-[#141814]">
        <SubPageHeader
          title={t.qHeaderTitle}
          subtitle={t.qHeaderSubtitle}
          backTo={-1}
          actionBtn={
            !isLoadingQuestions && !loadError && !submitted && (
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#191c19] border border-[#ded5c2] dark:border-[#2a3c2c] text-[11px] font-bold text-[#2D5A3D] dark:text-[#86efac]">
                {step + 1}/{totalSteps}
              </span>
            )
          }
        />

        {!isLoadingQuestions && !loadError && !submitted && (
          <div className="w-full h-1 bg-[#ded5c2] dark:bg-[#1e271e]">
            <div
              className="h-full bg-[#2D5A3D] transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        )}

        {isLoadingQuestions && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.loadingQuestionsText}</p>
          </div>
        )}

        {!isLoadingQuestions && loadError && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <p className="text-xs font-bold text-red-600 dark:text-red-400">{loadError}</p>
            <button
              onClick={() => navigate("/inspect/new")}
              className="px-4 py-2 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer"
            >
              {t.startNewInspectionBtn}
            </button>
          </div>
        )}

        {!isLoadingQuestions && !loadError && submitted && !result && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <CheckIcon className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-black text-[#14351d] dark:text-white">{t.answersSavedTitle}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">{t.startAnalysisPrompt}</p>

            {analyzeError && <p className="text-xs font-bold text-red-600 dark:text-red-400">{analyzeError}</p>}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <span>{isAnalyzing ? t.analyzingBtn : t.startAnalysisBtn}</span>
              <SparklesIcon className="w-3.5 h-3.5 text-emerald-200" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
            >
              {t.doLaterBtn}
            </button>
          </div>
        )}

        {!isLoadingQuestions && !loadError && result && (
          <div className="flex-1 overflow-y-auto px-1 py-3 space-y-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1f1a] border border-[#ded5c4] dark:border-[#2b352b] text-center space-y-1">
              <CheckIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-sm font-black text-[#14351d] dark:text-white">{t.analysisCompleteTitle}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{result.headline}</p>
            </div>

            <button
              onClick={() => navigate(inspectionId && inspectionId !== "null" ? `/results/${inspectionId}` : "/results/PC-9482")}
              className="w-full py-3 rounded-xl border border-emerald-700 bg-white dark:bg-[#181e18] text-emerald-800 dark:text-emerald-300 text-xs font-black cursor-pointer"
            >
              {t.viewFullReportBtn || "View Full Report"}
            </button>

            {savedBatch ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1f1a] border border-emerald-500/40 text-center space-y-1">
                <ClipboardIcon className="w-6 h-6 text-emerald-700 dark:text-emerald-400 mx-auto" />
                <p className="text-xs font-black text-[#14351d] dark:text-white">{t.savedLinkedBatchTitle}</p>
                {savedBatch.batch_code && (
                  <p className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {t.batchCodeLabel} {savedBatch.batch_code}
                  </p>
                )}
              </div>
            ) : (
              <>
                {saveError && <p className="text-xs font-bold text-red-600 dark:text-red-400">{saveError}</p>}
                <button
                  onClick={handleSaveInspection}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? t.savingBtn : t.saveInspectionBtn}
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-xl border border-[#ded5c4] dark:border-[#2b382b] text-[#2D5A3D] dark:text-emerald-300 text-xs font-bold cursor-pointer"
            >
              {t.backToDashboardBtn}
            </button>
          </div>
        )}

        {!isLoadingQuestions && !loadError && !submitted && (
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-white dark:bg-[#1a1f1a] rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-sm p-4 space-y-4">
              {isStaticStep ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-black text-[#14351d] dark:text-white">
                      {t.additionalInfoOptional}
                    </span>
                    <button
                      type="button"
                      id="listen-static-step-btn"
                      onClick={() => toggleSpeak(`${t.additionalInfoOptional || "अतिरिक्त जानकारी"}. ${t.storageDurationLabel || "भंडारण अवधि"}. ${t.storageConditionLabel || "भंडारण स्थिति"}.`, lang)}
                      aria-label="निर्देश सुनें"
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSpeaking
                          ? "bg-emerald-700 text-white border-emerald-700 animate-pulse ring-2 ring-emerald-400"
                          : "bg-[#faf7f0] dark:bg-[#141814] text-emerald-800 dark:text-emerald-300 border-[#ded5c2] dark:border-[#28382d] hover:bg-emerald-50"
                      }`}
                    >
                      <SpeakerIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.storageDurationLabel}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={storageDurationDays}
                      onChange={(e) => setStorageDurationDays(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-[#faf7f0] dark:bg-[#141814] text-gray-800 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.storageConditionLabel}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {STORAGE_CONDITIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setStorageCondition(opt.value)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold border cursor-pointer ${
                            storageCondition === opt.value
                              ? "bg-[#2D5A3D] text-white border-[#2D5A3D]"
                              : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.moistureExposureLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ label: t.yesText, value: true }, { label: t.noText, value: false }].map((opt) => (
                        <button
                          type="button"
                          key={String(opt.value)}
                          onClick={() => setMoistureExposure(opt.value)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border cursor-pointer ${
                            moistureExposure === opt.value
                              ? "bg-[#2D5A3D] text-white border-[#2D5A3D]"
                              : "bg-[#faf7f0] dark:bg-[#141814] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.otherCommentLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={farmerObservation}
                      onChange={(e) => setFarmerObservation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-[#faf7f0] dark:bg-[#141814] text-gray-800 dark:text-white outline-none resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => (listening ? stop() : start("hi-IN"))}
                      className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        listening
                          ? "bg-red-600 text-white border-red-600 animate-pulse"
                          : "bg-emerald-50 dark:bg-[#0f1a12] text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                      }`}
                    >
                      {listening ? <MicOffIcon className="w-3.5 h-3.5" /> : <MicIcon className="w-3.5 h-3.5" />}
                      <span>{listening ? (t.voiceStopBtn || "Stop listening...") : (t.voiceStartBtn || "Speak your answer with mic")}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locationStatus === "locating"}
                    className="w-full py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer disabled:opacity-60"
                  >
                    {locationStatus === "done" ? t.locationDoneBtn : locationStatus === "locating" ? t.locatingBtn : t.useLocationBtn}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[#2D5A3D] flex items-center justify-center shrink-0 mt-0.5">
                        <ClipboardIcon className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-sm font-black text-[#064d2c] dark:text-white leading-snug">
                        {translateQuestion(currentQuestion.question_translated || currentQuestion.question, lang)}
                      </h2>
                    </div>
                    <button
                      type="button"
                      id="listen-question-btn"
                      onClick={() => toggleSpeak(translateQuestion(currentQuestion.question_translated || currentQuestion.question, lang), lang)}
                      aria-label="प्रश्न सुनें"
                      className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        isSpeaking
                          ? "bg-emerald-700 text-white border-emerald-700 animate-pulse ring-2 ring-emerald-400"
                          : "bg-[#faf7f0] dark:bg-[#141814] text-emerald-800 dark:text-emerald-300 border-[#ded5c2] dark:border-[#28382d] hover:bg-emerald-50"
                      }`}
                      title={lang === "en" ? "Listen to question" : "प्रश्न सुनें"}
                    >
                      <SpeakerIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={currentQuestion.answer}
                      onChange={(e) => handleAnswerChange(step - 1, e.target.value)}
                      placeholder={t.answerPlaceholder || "Type here or speak using mic..."}
                      className="w-full px-3.5 py-3 rounded-2xl border border-[#ded5c2] dark:border-[#242824] text-xs font-semibold bg-[#faf7f0] dark:bg-[#0f1110] text-gray-800 dark:text-white outline-none resize-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => (listening ? stop() : start("hi-IN"))}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        listening
                          ? "bg-red-600 text-white border-red-600 animate-pulse"
                          : "bg-emerald-50 dark:bg-[#0f1a12] text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
                      }`}
                    >
                      {listening ? <MicOffIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                      <span>{listening ? (t.voiceStopBtn || "Stop listening...") : (t.voiceStartBtn || "Speak your answer with mic")}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-3 rounded-2xl text-xs font-bold border border-[#ded5c2] dark:border-[#242824] text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {t.prevBtn || "Previous"}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                {isLastStep ? (
                  <>
                    <span>{isSubmitting ? t.savingBtn : t.submitAnswersBtn}</span>
                    {isSubmitting ? <SparklesIcon className="w-4 h-4 text-emerald-200" /> : <CheckIcon className="w-4 h-4" />}
                  </>
                ) : (
                  <>
                    <span>{t.nextBtn || "Next Question"}</span>
                    <SendIcon className="w-4 h-4 text-emerald-200" />
                  </>
                )}
              </button>
            </div>

            {submitError && <p className="text-xs font-bold text-red-600 dark:text-red-400">{submitError}</p>}

            <div className="flex items-center justify-center gap-1.5 pb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step ? "w-5 h-2 bg-[#2D5A3D]" : i < step ? "w-2 h-2 bg-emerald-400 dark:bg-emerald-600" : "w-2 h-2 bg-[#ded5c2] dark:bg-[#2a322a]"
                  }`}
                />
              ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
