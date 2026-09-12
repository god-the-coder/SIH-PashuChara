import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import inspectionService from "../services/inspection/inspectionService";
import batchService from "../services/batches/batchService";
import SubPageHeader from "../components/layout/SubPageHeader";
import { CheckIcon } from "../components/common/Icons";

export default function InspectionQuestionnairePage() {
  const navigate = useNavigate();
  const { t, showToast } = useDashboard();

  const STORAGE_CONDITIONS = [
    { value: "GOOD", label: t.storageGood },
    { value: "FAIR", label: t.storageFair },
    { value: "POOR", label: t.storagePoor },
  ];

  const [inspectionId] = useState(() => sessionStorage.getItem("pashuchaara_inspection_id"));
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(() => Boolean(inspectionId));
  const [loadError, setLoadError] = useState(() =>
    inspectionId ? "" : t.errNoActiveInspection,
  );
  const [questions, setQuestions] = useState([]); // [{ question, answer }]

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

  // generateQuestions() calls Gemini fresh and overwrites the inspection's
  // followup_qa server-side every time it's called — it isn't idempotent. React's
  // StrictMode double-invokes mount effects in dev, and without this guard that
  // fires two overlapping calls whose responses can differ in question count,
  // leaving the form holding a different set than what's now stored server-side
  // (and answer submission failing with a length mismatch as a result).
  const hasRequestedQuestions = useRef(false);

  useEffect(() => {
    if (!inspectionId || hasRequestedQuestions.current) return;
    hasRequestedQuestions.current = true;

    // No cancellation flag here on purpose: the ref guard above already
    // guarantees this fetch only ever runs once, so — unlike a normal
    // effect — there's no second, superseding call whose cleanup should
    // suppress this one's result. Adding one back would just make the
    // single real fetch's own result never apply once StrictMode's
    // synthetic unmount runs its cleanup.
    inspectionService
      .generateQuestions(inspectionId)
      .then((inspection) => {
        setQuestions(inspection.followup_qa.map((q) => ({ question: q.question, answer: "" })));
      })
      .catch((apiError) => {
        setLoadError(apiError.message || t.errQuestionsFailed);
      })
      .finally(() => {
        setIsLoadingQuestions(false);
      });
  }, [inspectionId]);

  const handleAnswerChange = (index, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], answer: value };
    setQuestions(updated);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (questions.some((q) => !q.answer.trim())) {
      setSubmitError(t.errAllAnswersRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await inspectionService.submitAnswers(inspectionId, questions.map((q) => q.answer));

      const hasContext = storageCondition || moistureExposure !== null || farmerObservation.trim() || coords;
      if (hasContext) {
        await inspectionService.updateContext(inspectionId, {
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          storageCondition: storageCondition || undefined,
          moistureExposure: moistureExposure === null ? undefined : moistureExposure,
          farmerObservation: farmerObservation.trim() || undefined,
        });
      }

      setSubmitted(true);
      showToast(t.answersSavedToast);
    } catch (apiError) {
      setSubmitError(apiError.message || t.errAnswersSaveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzeError("");
    setIsAnalyzing(true);
    try {
      const analyzed = await inspectionService.analyze(inspectionId);
      setResult(analyzed);
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
      const saved = await inspectionService.save(inspectionId);
      if (saved.batch) {
        const batch = await batchService.getBatch(saved.batch);
        setSavedBatch(batch);
      } else {
        setSavedBatch({ id: null, batch_code: null });
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
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between p-4 shadow-xl bg-[#FAF7F0] dark:bg-[#141814]">
        <SubPageHeader
          title={t.qHeaderTitle}
          subtitle={t.qHeaderSubtitle}
          backTo={-1}
          actionBtn={
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#191c19] border border-[#ded5c2] dark:border-[#2a3c2c] text-[11px] font-bold text-[#2D5A3D] dark:text-[#86efac]">
              {t.stepIndicatorQuestions}
            </span>
          }
        />

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
              className="px-4 py-2.5 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? t.analyzingBtn : t.startAnalysisBtn}
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
              onClick={() => navigate(`/results/${inspectionId}`)}
              className="w-full py-3 rounded-xl border border-emerald-700 bg-white dark:bg-[#181e18] text-emerald-800 dark:text-emerald-300 text-xs font-black cursor-pointer"
            >
              {t.viewFullReportBtn || "View Full Report"}
            </button>

            {savedBatch ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1f1a] border border-emerald-500/40 text-center space-y-1">
                <span className="text-xl">📦</span>
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
          <form onSubmit={handleSubmit} className="my-3 space-y-3 flex-1 overflow-y-auto pr-0.5">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs">
                <label className="block text-xs font-black text-[#14351d] dark:text-white mb-2">
                  {idx + 1}. {q.question}
                </label>
                <textarea
                  required
                  rows={2}
                  value={q.answer}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-[#faf7f0] dark:bg-[#141814] text-gray-800 dark:text-white outline-none resize-none"
                />
              </div>
            ))}

            <div className="bg-white dark:bg-[#1a1f1a] p-3.5 rounded-3xl border border-[#ded5c4] dark:border-[#2b352b] shadow-xs space-y-3">
              <span className="block text-xs font-black text-[#14351d] dark:text-white">
                {t.additionalInfoOptional}
              </span>

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
                  rows={2}
                  value={farmerObservation}
                  onChange={(e) => setFarmerObservation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-[#faf7f0] dark:bg-[#141814] text-gray-800 dark:text-white outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locationStatus === "locating"}
                className="w-full py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold text-emerald-800 dark:text-emerald-300 cursor-pointer disabled:opacity-60"
              >
                {locationStatus === "done" ? t.locationDoneBtn : locationStatus === "locating" ? t.locatingBtn : t.useLocationBtn}
              </button>
            </div>

            {submitError && <p className="text-xs font-bold text-red-600 dark:text-red-400">{submitError}</p>}

            <div className="pt-1 pb-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isSubmitting ? t.savingBtn : t.submitAnswersBtn}</span>
                <CheckIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
