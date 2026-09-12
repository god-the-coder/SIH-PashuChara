import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { QRCodeSVG } from "qrcode.react";
import historyService from "../services/history/historyService";
import inspectionService from "../services/inspection/inspectionService";
import batchService from "../services/batches/batchService";
import { labelize, groupRecommendationsByUrgency } from "../utils/riskDisplay";

function addDays(isoString, days) {
  const dt = isoString ? new Date(isoString) : new Date();
  dt.setDate(dt.getDate() + days);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDate(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function indicatorsByCategory(indicators, category) {
  return indicators.filter((indicator) => indicator.category === category);
}

export default function LabReportPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { lang, showToast } = useDashboard();

  const [reportLang, setReportLang] = useState(lang === "hi" ? "hi" : "en");
  const [result, setResult] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [batch, setBatch] = useState(null);
  const [trend, setTrend] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([historyService.getResult(id), inspectionService.get(id)])
      .then(async ([resultData, inspectionData]) => {
        if (cancelled) return;
        setResult(resultData);
        setInspection(inspectionData);
        if (inspectionData.batch) {
          try {
            const [batchData, trendData] = await Promise.all([
              batchService.getBatch(inspectionData.batch),
              batchService.getTrend(inspectionData.batch),
            ]);
            if (!cancelled) {
              setBatch(batchData);
              setTrend(trendData);
            }
          } catch {
            // Batch/trend context is supplementary — the report still stands without it.
          }
        }
      })
      .catch((apiError) => {
        if (!cancelled) setLoadError(apiError.message || "Report not found.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isHi = reportLang === "hi";
  const L = (en, hi) => (isHi ? hi : en);
  const reportURL = `${window.location.origin}/history/${id}/report`;

  const handleShare = async () => {
    if (!result) return;
    const text = `${L("Diagnostic Screening Report", "डायग्नोस्टिक स्क्रीनिंग रिपोर्ट")} – #${id}: ${result.headline || labelize(result.risk_category)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: L("PashuChara AI Analytic Report", "पशुचारा AI विश्लेषणात्मक रिपोर्ट"), text, url: reportURL });
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
    } else {
      await navigator.clipboard?.writeText(reportURL).catch(() => {});
      showToast(L("Report link copied.", "रिपोर्ट लिंक कॉपी हो गया।"));
    }
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-gray-500">Loading report…</div>;
  }

  if (loadError || !result || !inspection) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center text-sm text-gray-600">
        {loadError || "Report not found."}
      </div>
    );
  }

  const indicators = result.findings?.indicators || [];
  const nutritionalEstimate = result.findings?.nutritional_estimate;
  const contaminationIndicators = indicatorsByCategory(indicators, "contamination");
  const silageQualityIndicators = indicatorsByCategory(indicators, "silage_quality");
  const storageIndicators = indicatorsByCategory(indicators, "storage_environment");
  const recommendationGroups = groupRecommendationsByUrgency(result.recommendations);
  const isAttention = result.risk_category === "HIGH" || result.risk_category === "UNCERTAIN";
  const validUntil = addDays(result.created_at, 14);

  return (
    <>
      {/* ─── Formal Monochrome Print Stylesheet ─── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          body { background: #ffffff !important; }
          @page { size: A4; margin: 10mm 12mm; }
        }
      `}</style>

      <div className="relative min-h-screen w-full overflow-x-hidden flex justify-center bg-slate-100 dark:bg-slate-950 antialiased print-page font-sans">
        <div className="relative z-10 w-full max-w-[480px] min-h-screen flex flex-col bg-white dark:bg-slate-900 border-x border-slate-300 dark:border-slate-800 print:bg-white print:border-none print:max-w-full">

          {/* ══════════════ TOP ACTION BAR (Screen only) ══════════════ */}
          <div className="no-print sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-3.5 py-2.5 flex items-center gap-2">
            <button
              onClick={() => navigate(`/history/${id}/info`)}
              className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold cursor-pointer hover:bg-slate-700 shrink-0 text-slate-200"
              aria-label="Back"
            >
              ←
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold tracking-tight truncate leading-tight text-white">
                {L("Analytical Report", "विश्लेषणात्मक रिपोर्ट")} | #{id}
              </p>
              {batch && (
                <p className="text-[9px] text-slate-400 font-mono">
                  REF: {batch.batch_code}
                </p>
              )}
            </div>

            <div className="flex rounded border border-slate-700 overflow-hidden shrink-0">
              {["en", "hi"].map((l) => (
                <button
                  key={l}
                  onClick={() => setReportLang(l)}
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                    reportLang === l
                      ? "bg-white text-slate-900 font-black"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={handleShare}
              className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs cursor-pointer hover:bg-slate-700 shrink-0 text-slate-200"
              aria-label="Share"
              title="Share"
            >
              ↗
            </button>

            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-white text-slate-900 text-[10px] font-bold cursor-pointer transition-colors shrink-0"
            >
              {L("Print / PDF", "प्रिंट / PDF")}
            </button>
          </div>

          {/* ══════════════ REPORT BODY ══════════════ */}
          <div className="p-4 space-y-3.5 flex-1 print:p-0 print:space-y-3 text-slate-900 dark:text-slate-100 print:text-black">

            {/* ── 1. Formal Institutional Header ── */}
            <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[8.5px] font-bold tracking-widest text-slate-500 uppercase">
                    {L("AI VISUAL DIAGNOSTIC SCREENING REPORT", "AI विज़ुअल डायग्नोस्टिक स्क्रीनिंग रिपोर्ट")}
                  </p>
                  <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                    {L("PashuChara AI Analytic Report", "पशुचारा AI विश्लेषणात्मक रिपोर्ट")}
                  </h1>
                  <p className="text-[9px] text-slate-600 dark:text-slate-400">
                    {L("Fodder & Silage Quality Diagnostic Assessment System", "चारा व साइलेज गुणवत्ता परीक्षण एवं विश्लेषण प्रणाली")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="border border-slate-900 dark:border-slate-300 px-2 py-0.5 text-[8px] font-black tracking-wider uppercase bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {isAttention ? L("STATUS: ATTENTION", "स्थिति: ध्यान दें") : L("STATUS: NORMAL", "स्थिति: सामान्य")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-[8.5px] text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 font-semibold">{L("Analysis Date", "विश्लेषण दिनांक")}:</span>
                  <span className="ml-1 font-mono font-bold text-slate-900 dark:text-slate-100">{formatDate(result.created_at)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">{L("Validity Period", "वैधता अवधि")}:</span>
                  <span className="ml-1 font-mono font-bold text-slate-900 dark:text-slate-100">{validUntil}</span>
                </div>
              </div>
            </div>

            {/* ── 2. Batch Identifiers ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 1: Sample & Batch Identification", "भाग 1: नमूना एवं बैच पहचान विवरण")}
                </h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 dark:divide-slate-800 text-[8.5px]">
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Inspection ID", "जाँच आईडी")}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">#{id}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Batch Code", "बैच कोड")}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{batch?.batch_code || L("Not saved", "सुरक्षित नहीं")}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Sample Type", "चारा प्रकार")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {inspection.material_type === "OTHER" ? inspection.material_type_other : labelize(inspection.material_type)}
                  </span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[7.5px] uppercase">{L("Storage Age", "भंडारण आयु")}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{inspection.storage_duration_days} {L("Days", "दिन")}</span>
                </div>
              </div>
            </div>

            {/* ── 3. Nutritional Quality ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 2: Nutritional Reference Estimate", "भाग 2: पोषण संदर्भ अनुमान")}
                </h2>
              </div>

              <div className="p-2 space-y-2 text-[8.5px]">
                {nutritionalEstimate ? (
                  <>
                    <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[8px] uppercase text-slate-600 dark:text-slate-400">
                          <th className="p-1.5 font-bold">{L("Parameter", "मापदण्ड")}</th>
                          <th className="p-1.5 font-bold font-mono text-right">{L("Estimated Value", "अनुमानित मान")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {nutritionalEstimate.crude_protein_percent && (
                          <tr>
                            <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Crude Protein", "क्रूड प्रोटीन")}</td>
                            <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                              {nutritionalEstimate.crude_protein_percent[0]}–{nutritionalEstimate.crude_protein_percent[1]}%
                            </td>
                          </tr>
                        )}
                        {nutritionalEstimate.fiber_percent && (
                          <tr>
                            <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Crude Fiber", "क्रूड फाइबर")}</td>
                            <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                              {nutritionalEstimate.fiber_percent[0]}–{nutritionalEstimate.fiber_percent[1]}%
                            </td>
                          </tr>
                        )}
                        {nutritionalEstimate.moisture_condition && (
                          <tr>
                            <td className="p-1.5 text-slate-700 dark:text-slate-300">{L("Moisture Condition", "नमी स्तर")}</td>
                            <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">
                              {labelize(nutritionalEstimate.moisture_condition)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <p className="text-[7.5px] text-slate-500 dark:text-slate-400">
                      {nutritionalEstimate.note || L(
                        "Approximate, reference-based estimate from visual analysis. Not a laboratory measurement.",
                        "दृश्य विश्लेषण पर आधारित अनुमानित मान। प्रयोगशाला माप नहीं।",
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">{L("Not assessed for this scan.", "इस जाँच हेतु मूल्यांकित नहीं।")}</p>
                )}
              </div>
            </div>

            {/* ── 4. Contamination & Physical Screening ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 3: Contamination & Physical Screening", "भाग 3: संदूषण एवं भौतिक स्क्रीनिंग परीक्षण")}
                </h2>
              </div>

              <div className="p-2 text-[8.5px]">
                {contaminationIndicators.length > 0 ? (
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[8px] uppercase text-slate-600 dark:text-slate-400">
                        <th className="p-1.5 font-bold">{L("Screening Assay", "परीक्षण मद")}</th>
                        <th className="p-1.5 font-bold text-right">{L("Severity", "गंभीरता")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {contaminationIndicators.map((indicator, i) => (
                        <tr key={i}>
                          <td className="p-1.5 text-slate-700 dark:text-slate-300 font-medium">{indicator.description || labelize(indicator.name)}</td>
                          <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{labelize(indicator.severity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">{L("No contamination indicators flagged.", "कोई संदूषण संकेतक नहीं पाया गया।")}</p>
                )}
                <p className="text-[7.5px] text-slate-500 mt-1">
                  {L("Screening based on visual diagnostic indices. Chemical & toxin assays require dedicated laboratory testing.", "दृश्य डायग्नोस्टिक सूचकांकों पर आधारित। रासायनिक एवं विषैले तत्वों हेतु समर्पित लैब परीक्षण आवश्यक है।")}
                </p>
              </div>
            </div>

            {/* ── 5. Silage / Fodder Quality ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 4: Silage & Fodder Quality Indicators", "भाग 4: साइलेज व चारा गुणवत्ता संकेतक")}
                </h2>
              </div>

              <div className="p-2 space-y-1.5 text-[8.5px]">
                {silageQualityIndicators.length > 0 ? (
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[8px] uppercase text-slate-600 dark:text-slate-400">
                        <th className="p-1.5 font-bold">{L("Indicator", "संकेतक")}</th>
                        <th className="p-1.5 font-bold text-right">{L("Severity", "गंभीरता")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {silageQualityIndicators.map((indicator, i) => (
                        <tr key={i}>
                          <td className="p-1.5 text-slate-700 dark:text-slate-300 font-medium">{indicator.description || labelize(indicator.name)}</td>
                          <td className="p-1.5 font-mono font-bold text-right text-slate-900 dark:text-slate-100">{labelize(indicator.severity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">{L("No quality deviations flagged.", "कोई गुणवत्ता विचलन नहीं पाया गया।")}</p>
                )}
              </div>
            </div>

            {/* ── 6. Storage & Environmental Telemetry ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 5: Storage & Ambient Telemetry", "भाग 5: भंडारण एवं वातावरणीय डेटा")}
                </h2>
                {(inspection.temperature_celsius != null || inspection.humidity_percent != null) && (
                  <span className="text-[8px] font-mono text-slate-600 dark:text-slate-400">
                    {inspection.temperature_celsius != null && `TEMP: ${inspection.temperature_celsius}°C`}
                    {inspection.humidity_percent != null && ` | RH: ${inspection.humidity_percent}%`}
                  </span>
                )}
              </div>

              <div className="p-2 text-[8.5px] space-y-1">
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Storage Condition", "भंडारण स्थिति")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {inspection.storage_condition ? labelize(inspection.storage_condition) : L("Not recorded", "दर्ज नहीं")}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Moisture Exposure", "नमी संपर्क")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {inspection.moisture_exposure == null ? L("Not recorded", "दर्ज नहीं") : (inspection.moisture_exposure ? L("Yes", "हाँ") : L("No", "नहीं"))}
                  </span>
                </div>
                {storageIndicators.map((indicator, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span className="text-slate-600 dark:text-slate-400">{indicator.description || labelize(indicator.name)}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{labelize(indicator.severity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 7. Farmer Declared Lot History ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 6: Farmer Declared Lot History", "भाग 6: किसान द्वारा दर्ज लॉट इतिहास")}
                </h2>
              </div>

              <div className="p-2 text-[8.5px] space-y-1">
                <div className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">{L("Storage Duration", "भंडारण अवधि")}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{inspection.storage_duration_days} {L("days", "दिन")}</span>
                </div>
                {inspection.farmer_observation && (
                  <div className="pt-0.5">
                    <span className="text-slate-500 text-[7.5px] block uppercase">{L("Farmer Sensory Observation", "किसान का संवेदी अवलोकन")}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{inspection.farmer_observation}</span>
                  </div>
                )}
                {inspection.followup_qa?.length > 0 && (
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[7.5px] block uppercase">{L("Follow-up Questions", "अनुवर्ती प्रश्न")}</span>
                    {inspection.followup_qa.map((qa, i) => (
                      <p key={i} className="text-slate-800 dark:text-slate-200">
                        <span className="text-slate-500">{qa.question}</span> — <span className="font-medium">{qa.answer}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── 8. Standard Action Protocols ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 7: Standard Operating Directives & Protocols", "भाग 7: मानक संचालन निर्देश एवं प्रोटोकॉल")}
                </h2>
              </div>

              <div className="p-2 space-y-2 text-[8.5px]">
                {recommendationGroups.IMMEDIATE.length > 0 && (
                  <div>
                    <p className="font-black uppercase text-[8px] text-slate-800 dark:text-slate-200 tracking-wider">
                      {L("1. Immediate Directives", "1. तत्काल निर्देश")}
                    </p>
                    <div className="pl-2 border-l-2 border-slate-800 dark:border-slate-400 space-y-0.5 mt-0.5">
                      {recommendationGroups.IMMEDIATE.map((rec) => (
                        <p key={rec.id} className="text-slate-800 dark:text-slate-200">{rec.text}</p>
                      ))}
                    </div>
                  </div>
                )}

                {recommendationGroups.CORRECTIVE.length > 0 && (
                  <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                    <p className="font-black uppercase text-[8px] text-slate-800 dark:text-slate-200 tracking-wider">
                      {L("2. Corrective Directives", "2. सुधारात्मक निर्देश")}
                    </p>
                    <div className="pl-2 border-l-2 border-slate-500 space-y-0.5 mt-0.5">
                      {recommendationGroups.CORRECTIVE.map((rec) => (
                        <p key={rec.id} className="text-slate-800 dark:text-slate-200">{rec.text}</p>
                      ))}
                    </div>
                  </div>
                )}

                {recommendationGroups.VERIFICATION.length > 0 && (
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="font-bold text-[8px] uppercase text-slate-700 dark:text-slate-300">
                      {L("3. Quantitative Verification Requirement", "3. मात्रात्मक सत्यापन आवश्यकता")}
                    </p>
                    {recommendationGroups.VERIFICATION.map((rec) => (
                      <p key={rec.id} className="text-slate-700 dark:text-slate-300 mt-0.5">{rec.text}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── 9. Feed Safety & Material Utilization ── */}
            <div className="border border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {L("Section 8: Feed Safety Assessment", "भाग 8: आहार सुरक्षा मूल्यांकन")}
                </h2>
              </div>

              <div className="p-2 space-y-1.5 text-[8.5px]">
                <p className="font-black uppercase text-slate-900 dark:text-white">
                  {result.action_label || labelize(result.risk_category)}
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* ── 10. Longitudinal Inspection History ── */}
            {trend?.points?.length > 0 && (
              <div className="border border-slate-300 dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 border-b border-slate-300 dark:border-slate-700">
                  <h2 className="text-[9px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {L("Section 9: Longitudinal Inspection History", "भाग 9: कालानुक्रमिक निरीक्षण इतिहास")}
                  </h2>
                </div>

                <div className="p-2">
                  <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 text-[8px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 uppercase text-slate-600 dark:text-slate-400">
                        <th className="p-1 font-bold">{L("Date", "दिनांक")}</th>
                        <th className="p-1 font-bold font-mono">{L("Risk Score", "जोखिम स्कोर")}</th>
                        <th className="p-1 font-bold font-mono">{L("Category", "श्रेणी")}</th>
                        <th className="p-1 font-bold">{L("Headline", "शीर्षक")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[...trend.points].reverse().map((point) => (
                        <tr key={point.inspection_id}>
                          <td className="p-1 font-medium whitespace-nowrap">{formatDate(point.date)}</td>
                          <td className="p-1 font-mono">{point.risk_score ?? "-"}</td>
                          <td className="p-1 font-mono font-bold text-slate-900 dark:text-slate-100">{labelize(point.risk_category)}</td>
                          <td className="p-1 text-slate-600 dark:text-slate-400">{point.headline}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── 11. QR Code & Sign-off ── */}
            <div className="border border-slate-400 dark:border-slate-600 p-2.5 flex items-center gap-3">
              <div className="shrink-0 flex flex-col items-center gap-0.5">
                <div className="p-1 bg-white border border-slate-300">
                  <QRCodeSVG value={reportURL} size={58} fgColor="#0f172a" bgColor="#ffffff" level="M" />
                </div>
                <span className="text-[6.5px] font-mono text-slate-500 uppercase">{L("Verify QR", "सत्यापन QR")}</span>
              </div>
              <div className="flex-1 space-y-0.5 text-[8px]">
                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider">
                  {L("AI-Generated Assessment", "AI-जनित मूल्यांकन")}
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {L("PashuChara AI Visual Assessment Report", "पशुचारा AI विज़ुअल मूल्यांकन रिपोर्ट")}
                </p>
                <p className="text-[7px] text-slate-500 dark:text-slate-400 leading-tight">
                  {L(
                    "This is an AI-generated visual screening, not a certified laboratory analysis. Valid for reference for 14 calendar days.",
                    "यह AI-जनित दृश्य जाँच है, प्रमाणित प्रयोगशाला विश्लेषण नहीं। संदर्भ हेतु 14 कैलेंडर दिवस तक मान्य।",
                  )}
                </p>
              </div>
            </div>

            <div className="h-12 no-print" />
          </div>
        </div>
      </div>
    </>
  );
}
