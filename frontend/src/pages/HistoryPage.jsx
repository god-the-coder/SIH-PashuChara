import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useDashboard();
  const [filter, setFilter] = useState("all");

  const records = [
    {
      id: "PC-9482",
      type: t.histReportCorn1 || t.qFodderCorn || "Corn Silage",
      date: "11 Sep 2026",
      time: "11:30 AM",
      status: t.safeStatus || "Safe",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      summary: t.histSumCorn || t.resultSummary || "Good silage coloration and normal fermentation. No mold detected.",
      category: "silage",
    },
    {
      id: "PC-9411",
      type: t.histReportBerseem || t.qFodderGreen || "Berseem Green Fodder",
      date: "07 Sep 2026",
      time: "04:15 PM",
      status: t.alert1Title ? t.alert1Title.slice(0, 10) : (t.statusAttention || "Attention"),
      statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
      summary: t.histSumBerseem || (t.alert1Body ? t.alert1Body.slice(0, 80) + "..." : "Slight dampness and yellowing due to high humidity."),
      category: "feed",
    },
    {
      id: "PC-9380",
      type: t.histReportSilage1 || `${t.qFodderCorn || "Silage"} #1`,
      date: "02 Sep 2026",
      time: "09:00 AM",
      status: t.safeStatus || "Safe",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      summary: t.histSumSilage1 || t.resultSummary || "Premium quality, pit securely airtight and sealed.",
      category: "silage",
    },
  ];

  const filtered = filter === "all" ? records : records.filter((r) => r.category === filter);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#ede7db] dark:bg-[#050706] antialiased">
      {/* Shared farm BG */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden bg-[#faf7f0] dark:bg-[#0a0c0b]">
          <img
            id="bg-image-history"
            src="/bg-farm.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.30 }}
          />
          <div className="absolute inset-0 bg-[#faf7f0]/62 dark:bg-[#0a0c0b]/74 pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-transparent border-x border-[#ded6c7] dark:border-[#1d221f]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.historyPageTitle || "जाँच इतिहास"}
          subtitle={t.historyPageSub || "पिछली सभी AI रिपोर्ट व परिणाम"}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => navigate("/inspect/new")}
              className="px-2.5 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              {t.newScanShort || "+ नई जाँच"}
            </button>
          }
        />

        {/* Filter Pills */}
        <div className="px-4 pt-3 flex items-center gap-2">
          {[
            { id: "all", label: t.filterAll || "सभी" },
            { id: "silage", label: t.filterSilage || "साइलेज" },
            { id: "feed", label: t.filterFeed || "पशु आहार" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                  : "bg-white dark:bg-[#161c18] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#242824]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History List */}
        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-[#064d2c] dark:text-[#e8e4dc]">
                  {item.type}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                  #{item.id}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-[#a8b8ab] leading-snug">
                {item.summary}
              </p>
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                <span>📅 {item.date} • {item.time}</span>
                <button
                  onClick={() => navigate(`/history/${item.id}/info`)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-[#161914] text-emerald-800 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-[#1e3828] cursor-pointer transition-colors"
                >
                  {t.moreInfoBtn || "अधिक जानकारी →"}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
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

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
