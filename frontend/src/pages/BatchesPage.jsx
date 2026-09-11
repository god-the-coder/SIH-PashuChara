import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function BatchesPage() {
  const navigate = useNavigate();
  const { t, showToast } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);

  const [batches, setBatches] = useState([
    {
      id: "batch-1",
      label: "मक्का साइलेज गड्ढा #1",
      type: "मक्का (Corn/Maize)",
      storageType: "बंकर गड्ढा (Bunker Pit)",
      createdDate: "20 अगस्त 2026",
      ageDays: 22,
      quantityKg: 5200,
      status: "किण्वित व तैयार (Mature)",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      lastInspectionRisk: "low",
    },
    {
      id: "batch-2",
      label: "ज्वार हरा चारा लॉट #4",
      type: "ज्वार (Sorghum)",
      storageType: "कवर्ड शेड (Covered Shed)",
      createdDate: "09 सितम्बर 2026",
      ageDays: 2,
      quantityKg: 1800,
      status: "दैनिक उपयोग में (In Use)",
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
      lastInspectionRisk: "medium",
    },
  ]);

  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchType, setNewBatchType] = useState("मक्का साइलेज");
  const [newBatchQty, setNewBatchQty] = useState("3000");

  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!newBatchName) return;
    const newEntry = {
      id: `batch-${Date.now()}`,
      label: newBatchName,
      type: newBatchType,
      storageType: "गड्ढा (Pit)",
      createdDate: "आज",
      ageDays: 0,
      quantityKg: Number(newBatchQty) || 1000,
      status: "नया भंडारित (Fresh)",
      statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
      lastInspectionRisk: "low",
    };
    setBatches([newEntry, ...batches]);
    setModalOpen(false);
    setNewBatchName("");
    showToast("नया चारा बैच सफलतापूर्वक जुड़ गया! 📦");
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.batchesPageTitle || "साइलेज व चारा लॉट्स"}
          subtitle={t.batchesPageSub || "कुल भंडारित स्टॉक व आयु ट्रैकिंग"}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => setModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              {t.addBatchBtn || "+ नया बैच"}
            </button>
          }
        />

        {/* Batch List */}
        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#19241d] border border-[#ded5c2] dark:border-[#28382d] shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#14351d] dark:text-white">
                    {batch.label}
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {batch.type}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${batch.statusColor}`}>
                  {batch.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-[#faf6ed] dark:bg-[#121914] border border-[#ded5c2] dark:border-[#28382d]">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                    {t.batchAgeLabel || "भंडारण आयु:"}
                  </span>
                  <div className="text-xs font-black text-[#14351d] dark:text-white mt-0.5">
                    {batch.ageDays} दिन
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-[#faf6ed] dark:bg-[#121914] border border-[#ded5c2] dark:border-[#28382d]">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                    {t.batchQtyAvailLabel || "उपलब्ध मात्रा:"}
                  </span>
                  <div className="text-xs font-black text-[#14351d] dark:text-white mt-0.5">
                    {batch.quantityKg.toLocaleString()} कि.ग्रा.
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  {batch.storageType}
                </span>
                <button
                  onClick={() => navigate(`/inspect/new?type=silage&batchId=${batch.id}`)}
                  className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-[#1a3324] text-emerald-800 dark:text-[#86efac] text-xs font-bold border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-[#20402e] cursor-pointer"
                >
                  जाँचें →
                </button>
              </div>
            </div>
          ))}
        </main>

        {/* Add Batch Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F0] dark:bg-[#16201a] w-full max-w-sm rounded-3xl p-5 border border-[#ded5c2] dark:border-[#28382d] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#ded5c2] dark:border-[#28382d]">
                <h3 className="text-sm font-black text-[#14351d] dark:text-white">
                  {t.addBatchBtn || "नया चारा/साइलेज बैच"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddBatch} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.batchNameLabel || "बैच का नाम"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जैसे: गड्ढा #2 मक्का साइलेज"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.batchTypeLabel || "चारे का प्रकार"}
                  </label>
                  <select
                    value={newBatchType}
                    onChange={(e) => setNewBatchType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
                  >
                    <option value="मक्का साइलेज">मक्का साइलेज (Corn Silage)</option>
                    <option value="ज्वार साइलेज">ज्वार साइलेज (Sorghum Silage)</option>
                    <option value="बरसीम हरा चारा">बरसीम हरा चारा (Berseem)</option>
                    <option value="गेहूं भूसा">गेहूं सूखा भूसा (Wheat Straw)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.batchQtyLabel || "अनुमानित मात्रा (कि.ग्रा.)"}
                  </label>
                  <input
                    type="number"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#28382d] text-xs font-bold bg-white dark:bg-[#121914] text-gray-800 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    {t.cancel || "रद्द करें"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {t.saveBatchBtn || "बैच सुरक्षित करें"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
