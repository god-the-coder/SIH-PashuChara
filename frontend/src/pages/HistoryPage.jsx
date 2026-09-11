import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import historyService from "../services/history/historyService";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

const MATERIAL_LABELS = {
  GREEN_FODDER: "हरा चारा",
  DRY_FODDER: "सूखा भूसा",
  SILAGE: "साइलेज",
  CONCENTRATE_FEED: "दाना मिश्रण",
  OTHER: "अन्य",
};

function formatDate(isoString) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleString("hi-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useDashboard();
  const [filter, setFilter] = useState("all");

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [results, setResults] = useState({}); // inspectionId -> result | 'loading' | 'error'

  useEffect(() => {
    let cancelled = false;
    historyService
      .listSaved()
      .then((data) => {
        if (!cancelled) setRecords(data);
      })
      .catch((apiError) => {
        if (!cancelled) setLoadError(apiError.message || "इतिहास लोड नहीं हो सका।");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = filter === "all" ? records : records.filter((r) => r.inspection_type === filter);

  const handleToggle = async (inspection) => {
    if (expandedId === inspection.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(inspection.id);
    if (results[inspection.id]) return;

    setResults((prev) => ({ ...prev, [inspection.id]: "loading" }));
    try {
      const result = await historyService.getResult(inspection.id);
      setResults((prev) => ({ ...prev, [inspection.id]: result }));
    } catch {
      setResults((prev) => ({ ...prev, [inspection.id]: "error" }));
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        <SubPageHeader
          title={t.historyPageTitle || "जाँच इतिहास"}
          subtitle={t.historyPageSub || "पिछली सभी सुरक्षित जाँच"}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => navigate("/inspect/new")}
              className="px-2.5 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              + नई जाँच
            </button>
          }
        />

        <div className="px-4 pt-3 flex items-center gap-2">
          {[
            { id: "all", label: t.filterAll || "सभी" },
            { id: "SILAGE", label: t.filterSilage || "साइलेज" },
            { id: "FEED", label: t.filterFeed || "पशु आहार" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                  : "bg-white dark:bg-[#19241d] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          {isLoading && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-8">लोड हो रहा है...</p>
          )}

          {!isLoading && loadError && (
            <p className="text-center text-xs font-bold text-red-600 dark:text-red-400 py-8">{loadError}</p>
          )}

          {!isLoading && !loadError && filtered.map((item) => {
            const materialLabel = item.material_type === "OTHER"
              ? item.material_type_other
              : (MATERIAL_LABELS[item.material_type] || item.material_type);
            const resultState = results[item.id];

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#19241d] border border-[#ded5c2] dark:border-[#28382d] shadow-sm hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer"
                onClick={() => handleToggle(item)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-[#14351d] dark:text-[#f3ede2]">
                    {materialLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {item.inspection_type === "SILAGE" ? "साइलेज" : "पशु आहार"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-[#a8b8ab] leading-snug">
                  भंडारण अवधि: {item.storage_duration_days} दिन
                </p>
                <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                  <span>📅 {formatDate(item.saved_at)}</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-400">
                    {expandedId === item.id ? "बंद करें ↑" : (t.viewReportBtn || "रिपोर्ट देखें →")}
                  </span>
                </div>

                {expandedId === item.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 text-xs space-y-1" onClick={(e) => e.stopPropagation()}>
                    {resultState === "loading" && <p className="text-gray-500 dark:text-gray-400">लोड हो रहा है...</p>}
                    {resultState === "error" && <p className="text-gray-500 dark:text-gray-400">इस जाँच का अभी कोई विश्लेषण नहीं है।</p>}
                    {resultState && typeof resultState === "object" && (
                      <>
                        <p><span className="font-bold">जोखिम श्रेणी:</span> {resultState.risk_category}</p>
                        <p><span className="font-bold">शीर्षक:</span> {resultState.headline}</p>
                        <p><span className="font-bold">सारांश:</span> {resultState.summary}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!isLoading && !loadError && filtered.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">📋</span>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">
                {t.noRecordsFound || "कोई रिकॉर्ड नहीं मिला"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {t.noRecordsDesc || "इस श्रेणी में कोई पूर्व जाँच उपलब्ध नहीं है।"}
              </p>
            </div>
          )}
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
