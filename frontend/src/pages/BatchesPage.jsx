import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import batchService from "../services/batches/batchService";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

const MATERIAL_LABELS = {
  GREEN_FODDER: "हरा चारा",
  DRY_FODDER: "सूखा भूसा",
  SILAGE: "साइलेज",
  CONCENTRATE_FEED: "दाना मिश्रण",
  OTHER: "अन्य",
};

export default function BatchesPage() {
  const navigate = useNavigate();
  const { showToast } = useDashboard();

  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [qrBatchId, setQrBatchId] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [trendByBatch, setTrendByBatch] = useState({});

  const [codeInput, setCodeInput] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [resolvedBatch, setResolvedBatch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    batchService
      .list()
      .then((data) => {
        if (!cancelled) setBatches(data);
      })
      .catch((apiError) => {
        if (!cancelled) setLoadError(apiError.message || "बैच सूची लोड नहीं हो सकी।");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleShowQr = async (batchId) => {
    if (qrBatchId === batchId) {
      setQrBatchId(null);
      if (qrUrl) URL.revokeObjectURL(qrUrl);
      setQrUrl(null);
      return;
    }
    try {
      const url = await batchService.getQrObjectUrl(batchId);
      setQrUrl(url);
      setQrBatchId(batchId);
    } catch (apiError) {
      showToast(apiError.message || "QR कोड लोड नहीं हो सका।");
    }
  };

  const handleShowTrend = async (batchId) => {
    if (trendByBatch[batchId]) {
      setTrendByBatch((prev) => ({ ...prev, [batchId]: undefined }));
      return;
    }
    try {
      const trend = await batchService.getTrend(batchId);
      setTrendByBatch((prev) => ({ ...prev, [batchId]: trend }));
    } catch (apiError) {
      showToast(apiError.message || "ट्रेंड लोड नहीं हो सका।");
    }
  };

  const handleResolveCode = async (e) => {
    e.preventDefault();
    setResolveError("");
    setResolvedBatch(null);
    if (!codeInput.trim()) return;

    setIsResolving(true);
    try {
      const batch = await batchService.resolveByCode(codeInput.trim());
      if (!batch) {
        setResolveError("यह बैच कोड नहीं मिला या आपका नहीं है।");
      } else {
        setResolvedBatch(batch);
      }
    } catch (apiError) {
      setResolveError(apiError.message || "बैच नहीं मिल सका।");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        <SubPageHeader
          title="साइलेज व चारा बैच"
          subtitle="बैच QR, ट्रेंड व पुनः जाँच"
          backTo="/dashboard"
        />

        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          <form onSubmit={handleResolveCode} className="p-3.5 rounded-2xl bg-white dark:bg-[#19241d] border border-[#ded5c2] dark:border-[#28382d] shadow-sm space-y-2">
            <label className="block text-xs font-black text-[#14351d] dark:text-white">
              बैच कोड डालकर पुनः जाँच करें
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="जैसे: PC-XXXXXXXX"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-[#faf6ed] dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
              />
              <button
                type="submit"
                disabled={isResolving}
                className="px-4 py-2 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {isResolving ? "..." : "खोजें"}
              </button>
            </div>
            {resolveError && <p className="text-xs font-bold text-red-600 dark:text-red-400">{resolveError}</p>}
            {resolvedBatch && (
              <div className="mt-2 p-3 rounded-xl bg-[#faf6ed] dark:bg-[#121914] border border-[#ded5c2] dark:border-[#28382d] space-y-1.5">
                <p className="text-xs font-black text-[#14351d] dark:text-white">{resolvedBatch.batch_label}</p>
                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  {MATERIAL_LABELS[resolvedBatch.material_type] || resolvedBatch.material_type}
                  {resolvedBatch.quantity_kg != null && ` • ${resolvedBatch.quantity_kg} कि.ग्रा.`}
                </p>
                {resolvedBatch.latest_result ? (
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    अंतिम जोखिम: <span className="font-bold">{resolvedBatch.latest_result.risk_category}</span> — {resolvedBatch.latest_result.headline}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">अभी तक कोई विश्लेषण नहीं</p>
                )}
                <button
                  onClick={() => navigate(`/inspect/new?type=silage&batchId=${resolvedBatch.id}`)}
                  className="w-full mt-1 py-2 rounded-lg bg-emerald-50 dark:bg-[#1a3324] text-emerald-800 dark:text-[#86efac] text-xs font-bold border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-100 cursor-pointer"
                >
                  इस बैच की पुनः जाँच करें →
                </button>
              </div>
            )}
          </form>

          {isLoading && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-8">लोड हो रहा है...</p>
          )}
          {!isLoading && loadError && (
            <p className="text-center text-xs font-bold text-red-600 dark:text-red-400 py-8">{loadError}</p>
          )}
          {!isLoading && !loadError && batches.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">📦</span>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">कोई बैच नहीं मिला</h3>
              <p className="text-xs text-gray-500 mt-1">कोई जाँच सुरक्षित करने पर यहाँ बैच अपने आप बन जाएगा।</p>
            </div>
          )}

          {!isLoading && !loadError && batches.map((batch) => {
            const trend = trendByBatch[batch.id];
            return (
              <div
                key={batch.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#19241d] border border-[#ded5c2] dark:border-[#28382d] shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#14351d] dark:text-white">{batch.batch_label}</h3>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {MATERIAL_LABELS[batch.material_type] || batch.material_type}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400">{batch.batch_code}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-[#faf6ed] dark:bg-[#121914] border border-[#ded5c2] dark:border-[#28382d]">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">प्रकार:</span>
                    <div className="text-xs font-black text-[#14351d] dark:text-white mt-0.5">
                      {batch.inspection_type === "SILAGE" ? "साइलेज" : "पशु आहार"}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#faf6ed] dark:bg-[#121914] border border-[#ded5c2] dark:border-[#28382d]">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">मात्रा:</span>
                    <div className="text-xs font-black text-[#14351d] dark:text-white mt-0.5">
                      {batch.quantity_kg != null ? `${batch.quantity_kg} कि.ग्रा.` : "अज्ञात"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/10">
                  <button
                    onClick={() => handleShowQr(batch.id)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#1a3324] text-emerald-800 dark:text-[#86efac] text-xs font-bold border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-100 cursor-pointer"
                  >
                    {qrBatchId === batch.id ? "QR छुपाएँ" : "📱 QR दिखाएँ"}
                  </button>
                  <button
                    onClick={() => handleShowTrend(batch.id)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121914] text-gray-700 dark:text-gray-300 text-xs font-bold border border-[#ded5c2] dark:border-[#28382d] hover:bg-gray-50 cursor-pointer"
                  >
                    {trend ? "ट्रेंड छुपाएँ" : "📈 ट्रेंड"}
                  </button>
                  <button
                    onClick={() => navigate(`/inspect/new?type=silage&batchId=${batch.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-[#2D5A3D] text-white text-xs font-bold cursor-pointer"
                  >
                    जाँचें →
                  </button>
                </div>

                {qrBatchId === batch.id && qrUrl && (
                  <div className="flex flex-col items-center gap-1.5 pt-2">
                    <img src={qrUrl} alt={`QR for ${batch.batch_code}`} className="w-32 h-32 rounded-xl border border-[#ded5c2] dark:border-[#28382d]" />
                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{batch.batch_code}</span>
                  </div>
                )}

                {trend && (
                  <div className="pt-2 text-xs space-y-1">
                    <p><span className="font-bold">जोखिम बढ़ रहा है:</span> {trend.is_increasing ? "हाँ" : "नहीं"}</p>
                    {trend.insight && <p className="text-gray-600 dark:text-gray-300">{trend.insight}</p>}
                    {trend.points.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400">अभी कोई सुरक्षित परिणाम नहीं</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
