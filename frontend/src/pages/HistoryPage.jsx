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
      type: "मक्का साइलेज",
      date: "11 सितम्बर 2026",
      time: "11:30 AM",
      status: "ठीक",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      summary: "साइलेज का रंग अच्छा और किण्वन सामान्य। कोई फफूंद नहीं पाई गई।",
      category: "silage",
    },
    {
      id: "PC-9411",
      type: "बरसीम हरा चारा",
      date: "07 सितम्बर 2026",
      time: "04:15 PM",
      status: "ध्यान दें",
      statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
      summary: "अधिक आर्द्रता और बारिश के कारण चारे में हल्की सीलन और पीलापन।",
      category: "feed",
    },
    {
      id: "PC-9380",
      type: "ज्वार साइलेज पिट #1",
      date: "02 सितम्बर 2026",
      time: "09:00 AM",
      status: "ठीक",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      summary: "उच्च गुणवत्ता, गड्ढा अच्छी तरह वायुरोधी (airtight) ढका पाया गया।",
      category: "silage",
    },
  ];

  const filtered = filter === "all" ? records : records.filter((r) => r.category === filter);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
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
              + {t.newScanActionBtn?.slice(0, 8) || "नई जाँच"}
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
                  : "bg-white dark:bg-[#19241d] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#28382d]"
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
              onClick={() => navigate(`/results/${item.id}`)}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#19241d] border border-[#ded5c2] dark:border-[#28382d] shadow-sm hover:border-emerald-600 dark:hover:border-emerald-500 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-[#14351d] dark:text-[#f3ede2]">
                  {item.type}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-[#a8b8ab] leading-snug">
                {item.summary}
              </p>
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                <span>📅 {item.date} • {item.time}</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  {t.viewReportBtn || "रिपोर्ट देखें →"}
                </span>
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
