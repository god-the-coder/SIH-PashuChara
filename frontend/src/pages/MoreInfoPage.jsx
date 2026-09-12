import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";
import historyService from "../services/history/historyService";
import inspectionService from "../services/inspection/inspectionService";
import { labelize, RISK_BADGE_STYLES } from "../utils/riskDisplay";
import { ClipboardIcon, MicroscopeIcon, LightbulbIcon, DocumentIcon, CheckIcon, AlertTriangleIcon } from "../components/common/Icons";

function formatDateTime(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function MoreInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, lang } = useDashboard();

  const [result, setResult] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([historyService.getResult(id), inspectionService.get(id)])
      .then(([resultData, inspectionData]) => {
        if (cancelled) return;
        setResult(resultData);
        setInspection(inspectionData);
      })
      .catch((apiError) => {
        if (!cancelled) setLoadError(apiError.message || t.recordNotFound);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, t.recordNotFound]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex justify-center bg-[#ede7db] dark:bg-[#050706]">
        <div className="relative z-10 w-full max-w-[430px] min-h-screen flex items-center justify-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.loadingText}</p>
        </div>
      </div>
    );
  }

  if (loadError || !result) {
    return (
      <div className="relative min-h-screen w-full flex justify-center bg-[#ede7db] dark:bg-[#050706]">
        <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <ClipboardIcon className="w-12 h-12 text-emerald-700/60 dark:text-emerald-400/60 mb-4" />
          <h2 className="text-sm font-black text-gray-700 dark:text-gray-200">
            {loadError || t.recordNotFound || (lang === "hi" ? "रिकॉर्ड नहीं मिला" : "Record not found")}
          </h2>
          <button
            onClick={() => navigate("/history")}
            className="mt-4 px-4 py-2 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold"
          >
            ← {t.backToHistory || (lang === "hi" ? "इतिहास पर वापस" : "Back to History")}
          </button>
        </div>
      </div>
    );
  }

  const badgeStyle = RISK_BADGE_STYLES[result.risk_category] || RISK_BADGE_STYLES.UNCERTAIN;
  const insights = (result.findings?.indicators || []).filter((i) => i.description);
  const recommendations = result.recommendations || [];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#ede7db] dark:bg-[#050706] antialiased">
      {/* Farm BG */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden bg-[#faf7f0] dark:bg-[#0a0c0b]">
          <img
            src="/bg-farm.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.28 }}
          />
          <div className="absolute inset-0 bg-[#faf7f0]/64 dark:bg-[#0a0c0b]/74 pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-transparent border-x border-[#ded6c7] dark:border-[#1d221f]">
        <SubPageHeader
          title={t.moreInfoPageTitle || (lang === "hi" ? "त्वरित विवरण" : "Quick Summary")}
          subtitle={t.moreInfoPageSub || (lang === "hi" ? "AI विश्लेषण सारांश" : "AI Scan Analysis Summary")}
          backTo="/history"
          actionBtn={
            <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#191c19] border border-[#ded5c2] dark:border-[#2a3c2c] text-[10px] font-bold text-[#2D5A3D] dark:text-[#86efac]">
              #{id}
            </span>
          }
        />

        <main className="p-4 space-y-3 flex-1 overflow-y-auto pb-6">

          {/* Card 1: Overview + Risk badge */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                {t.batchOverviewLabel || (lang === "hi" ? "बैच विवरण" : "Batch Overview")}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border flex items-center gap-1 ${badgeStyle}`}>
                <span>{labelize(result.risk_category)}</span>
                {result.risk_category === "LOW" ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  <AlertTriangleIcon className="w-3 h-3" />
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t.fodderTypeLabel || (lang === "hi" ? "चारा प्रकार" : "Fodder Type"), value: labelize(inspection?.material_type || "") },
                { label: t.batchCodeLabel || "Batch:", value: inspection?.batch ? `#${inspection.batch}` : (t.notYetSavedBatchText || "Not saved") },
                { label: t.dateTimeLabel || (lang === "hi" ? "दिनांक व समय" : "Date & Time"), value: formatDateTime(result.created_at) },
                { label: t.confidenceLabel?.replace(":", "") || "Confidence", value: result.confidence != null ? `${result.confidence}%` : "-" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-2.5 rounded-xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#ded5c2] dark:border-[#242824]"
                >
                  <div className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    {row.label}
                  </div>
                  <div className="text-xs font-black text-[#064d2c] dark:text-white leading-snug">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: AI Insights */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2.5">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
              <MicroscopeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {t.keyInsightsLabel || (lang === "hi" ? "मुख्य AI निष्कर्ष" : "Key AI Insights")}
            </h3>
            <ul className="space-y-2">
              {insights.length > 0 ? insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed p-2.5 rounded-xl bg-[#f0f9f3] dark:bg-[#0d1c12] border border-emerald-100 dark:border-emerald-900/30"
                >
                  <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0 text-sm leading-snug">
                    {i + 1}.
                  </span>
                  <span>{insight.description}</span>
                </li>
              )) : (
                <li className="text-xs text-gray-500 dark:text-gray-400">{result.summary}</li>
              )}
            </ul>
          </div>

          {/* Card 3: Farmer Recommendations */}
          {recommendations.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2.5">
              <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
                <LightbulbIcon className="w-4 h-4 text-amber-500" />
                {t.farmerRecsLabel || (lang === "hi" ? "किसान सुझाव" : "Farmer Recommendations")}
              </h3>
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li
                    key={rec.id}
                    className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed p-2.5 rounded-xl bg-[#fffbeb] dark:bg-[#1a1507] border border-amber-100 dark:border-amber-900/30"
                  >
                    <span className="text-amber-500 font-black shrink-0 text-sm leading-snug">
                      {i + 1}.
                    </span>
                    <span>{rec.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Get Full Report CTA */}
          <div className="pt-1 pb-2">
            <button
              onClick={() => navigate(`/history/${id}/report`)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D5A3D] to-[#1a4428] hover:from-[#1E442B] hover:to-[#153820] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <DocumentIcon className="w-4 h-4" />
              <span>{t.getFullReportBtn || (lang === "hi" ? "पूरी लैब रिपोर्ट देखें →" : "Get Full Lab Report →")}</span>
            </button>
          </div>
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
