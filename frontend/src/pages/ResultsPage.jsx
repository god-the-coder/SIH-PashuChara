import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";
import historyService from "../services/history/historyService";
import batchService from "../services/batches/batchService";
import inspectionService from "../services/inspection/inspectionService";
import { labelize, RISK_BANNER_STYLES, SEVERITY_BADGE_STYLES } from "../utils/riskDisplay";
import { ShareIcon, ClockIcon, LightbulbIcon, CameraIcon, AlertTriangleIcon } from "../components/common/Icons";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, showToast } = useDashboard();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [batch, setBatch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    historyService.getResult(id)
      .then(async (data) => {
        if (cancelled) return;
        setResult(data);
        try {
          const inspection = await inspectionService.get(id);
          if (!cancelled && inspection.batch) {
            const batchData = await batchService.getBatch(inspection.batch);
            if (!cancelled) setBatch(batchData);
          }
        } catch {
          // Batch info is a nice-to-have for the header — never block the report on it.
        }
      })
      .catch((apiError) => {
        if (!cancelled) setLoadError(apiError.message || t.noAnalysisYetText);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, t.noAnalysisYetText]);

  const handleShare = () => {
    if (!result) return;
    const text = `${result.headline || labelize(result.risk_category)}: ${result.summary}`;
    if (navigator.share) {
      navigator.share({ title: t.shareReportTitle || "पशुचारा AI जाँच रिपोर्ट", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
      showToast(t.toastAllRead ? "रिपोर्ट लिंक कॉपी हो गया!" : "Report copied!");
    }
  };

  const riskStyle = RISK_BANNER_STYLES[result?.risk_category] || RISK_BANNER_STYLES.UNCERTAIN;
  const indicators = result?.findings?.indicators || [];
  const nutritionalEstimate = result?.findings?.nutritional_estimate;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        <SubPageHeader
          title={t.resultsHeaderTitle || "AI गुणवत्ता जाँच रिपोर्ट"}
          subtitle={batch ? `Batch: ${batch.batch_code}` : (t.notYetSavedBatchText || "Not yet saved to a batch")}
          backTo="/dashboard"
          actionBtn={
            result && (
              <button
                onClick={handleShare}
                aria-label="Share Report"
                className="w-8 h-8 rounded-xl bg-white dark:bg-[#191c19] border border-[#ded5c2] dark:border-[#2a3c2c] text-emerald-800 dark:text-emerald-300 flex items-center justify-center cursor-pointer hover:bg-gray-50"
              >
                <ShareIcon className="w-4 h-4" />
              </button>
            )
          }
        />

        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {isLoading && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-10">{t.loadingText}</p>
          )}

          {!isLoading && loadError && (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{loadError}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer"
              >
                {t.backToDashboardBtn || "डैशबोर्ड पर वापस जाएँ"}
              </button>
            </div>
          )}

          {!isLoading && !loadError && result && (
            <>
              {/* Main Risk Badge Banner */}
              <div className={`rounded-3xl p-4 bg-gradient-to-br ${riskStyle.gradient} text-white shadow-lg border border-white/10 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${riskStyle.dot} animate-ping`} />
                    <span className={`text-xs font-black uppercase tracking-wider ${riskStyle.tag}`}>
                      {labelize(result.risk_category)} {t.qualityStatusBadge || "गुणवत्ता स्थिति"}
                    </span>
                  </div>
                  {result.confidence != null && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono font-bold text-white">
                      {result.confidence}% {t.confidenceLabel?.replace(":", "") || "Confidence"}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {result.headline || labelize(result.risk_category)}
                  </h2>
                  <p className="text-xs text-white/90 mt-1.5 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {result.action_label && (
                  <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-2 text-xs font-bold text-white/90">
                    <ClockIcon className="w-4 h-4 shrink-0" />
                    <span>{result.action_label}</span>
                  </div>
                )}

                {result.requires_lab_testing && (
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-amber-200">
                    <span>🧪 {t.labTestRequiredLabel?.replace(":", "") || "Lab testing recommended"}</span>
                  </div>
                )}
              </div>

              {/* Comparison vs previous inspection */}
              {result.comparison && (
                <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2">
                  <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                    {t.riskTrendComparisonHeader || "Re-inspection Advisory"}
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{result.comparison.summary}</p>
                  {result.comparison.risk_score_delta != null && (
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      Δ {result.comparison.risk_score_delta > 0 ? "+" : ""}{result.comparison.risk_score_delta} {t.riskScoreLabel?.replace(":", "") || "risk score"}
                    </p>
                  )}
                </div>
              )}

              {/* Key Findings Card */}
              {indicators.length > 0 && (
                <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                    {t.keyFindingsHeader || "मुख्य दृश्य निरीक्षण (Key Findings)"}
                  </h3>
                  <ul className="space-y-2">
                    {indicators.map((indicator, i) => (
                      <li key={i} className="flex items-start justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">
                        <span className="flex items-start gap-2">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">•</span>
                          <span>{indicator.description || labelize(indicator.name)}</span>
                        </span>
                        {indicator.verify_only ? (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {t.labTestRequiredLabel?.replace(":", "") || "Verify"}
                          </span>
                        ) : (
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${SEVERITY_BADGE_STYLES[indicator.severity] || SEVERITY_BADGE_STYLES.none}`}>
                            {labelize(indicator.severity)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nutritional reference estimate */}
              {nutritionalEstimate && (
                <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2">
                  <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                    {t.nutritionalEstimateHeader || "Nutritional Reference Estimate"}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {nutritionalEstimate.crude_protein_percent && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2 text-center">
                        <b>{nutritionalEstimate.crude_protein_percent[0]}–{nutritionalEstimate.crude_protein_percent[1]}%</b>
                        <br />Crude Protein
                      </div>
                    )}
                    {nutritionalEstimate.fiber_percent && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-2 text-center">
                        <b>{nutritionalEstimate.fiber_percent[0]}–{nutritionalEstimate.fiber_percent[1]}%</b>
                        <br />Crude Fiber
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                    {nutritionalEstimate.note || t.referenceEstimateNote || "Approximate, reference-based estimate — not a laboratory measurement."}
                  </p>
                </div>
              )}

              {/* Recommendations Card */}
              {result.recommendations?.length > 0 && (
                <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
                  <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                    {t.recommendationsHeader || "किसान सलाह एवं सावधानियां"}
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec) => (
                      <li key={rec.id} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 leading-snug">
                        <span className="text-amber-600 shrink-0 mt-0.5">
                          {rec.urgency === "IMMEDIATE" ? (
                            <AlertTriangleIcon className="w-3.5 h-3.5" />
                          ) : (
                            <LightbulbIcon className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span>{rec.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 pb-2 space-y-2">
                <button
                  onClick={() => navigate(`/history/${id}/report`)}
                  className="w-full py-3 rounded-2xl border border-emerald-700 bg-white text-xs font-black text-emerald-800 dark:bg-[#181e18] dark:text-emerald-300"
                >
                  {t.viewLabReportBtn || "View detailed lab-style report"}
                </button>
                <button
                  onClick={() => navigate("/inspect/new")}
                  className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>{t.newScanActionBtn || "नई जाँच शुरू करें"}</span>
                </button>
              </div>
            </>
          )}
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
