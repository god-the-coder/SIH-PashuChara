import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";
import { getBatchAgeDays, getBatches, saveBatches, setActiveBatch } from "../utils/batchStore";
import { CloseIcon, PlusIcon, CornIcon, GrainIcon } from "../components/common/Icons";

export default function BatchesPage() {
  const navigate = useNavigate();
  const { t, showToast } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);

  const [batches, setBatches] = useState(getBatches);
  /*
    {
      id: "batch-1",
      labelKey: "batchPit1Corn",
      customLabel: "",
      typeKey: "batchTypeCorn",
      storageKey: "storageBunkerPit",
      createdDateKey: "batchDateAug20",
      ageDays: 22,
      quantityKg: 5200,
      statusKey: "batchMature",
      statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      lastInspectionRisk: "low",
      scanHistory: [
        { date: "02 Sep 2026", moisture: "63.1%", ph: "4.3", qualityScore: "B+", statusKey: "batchMature" },
        { date: "11 Sep 2026", moisture: "62.4%", ph: "4.1", qualityScore: "A",  statusKey: "batchMature" },
      ],
    },
    {
      id: "batch-2",
      labelKey: "batchLot4Sorghum",
      customLabel: "",
      typeKey: "batchTypeSorghum",
      storageKey: "storageCoveredShed",
      createdDateKey: "batchDateSep09",
      ageDays: 2,
      quantityKg: 1800,
      statusKey: "batchInUse",
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
      lastInspectionRisk: "medium",
      scanHistory: [
        { date: "09 Sep 2026", moisture: "71.0%", ph: "5.8", qualityScore: "B", statusKey: "batchInUse" },
      ],
    },
  ]); */

  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchTypeKey, setNewBatchTypeKey] = useState("batchTypeCorn");
  const [newBatchQty, setNewBatchQty] = useState("3000");

  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!newBatchName) return;
    const newEntry = {
      id: `PC-${String(Date.now()).slice(-6)}`,
      batchNumber: `BN-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      labelKey: "",
      customLabel: newBatchName,
      typeKey: newBatchTypeKey,
      typeLabel: t[newBatchTypeKey] || newBatchTypeKey,
      inspectionType: newBatchTypeKey === "batchTypeCorn" ? "silage" : "feed",
      storageKey: "storagePit",
      createdAt: new Date().toISOString(),
      quantityKg: Number(newBatchQty) || 1000,
      statusKey: "batchFresh",
      statusColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
      lastInspectionRisk: "low",
    };
    const updated = [newEntry, ...batches];
    setBatches(updated);
    saveBatches(updated);
    setModalOpen(false);
    setNewBatchName("");
    showToast(t.batchAddedToast || "New fodder batch added successfully!");
  };

  // Update existing batch in-place; keep only latest 2 scans
  const updateBatchInspection = (batchId, newScanData) => {
    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id !== batchId) return batch;
        const existingScans = batch.scanHistory || [];
        const updatedScans = [newScanData, ...existingScans].slice(0, 2);
        return {
          ...batch,
          lastTested: newScanData.date,
          statusKey: newScanData.statusKey || batch.statusKey,
          scanHistory: updatedScans,
        };
      })
    );
    showToast(t.batchUpdatedToast || "Batch inspection updated");
  };

  // Expose via sessionStorage contract for InspectionQuestionnairePage
  // It writes pashuchaara_inspect_result on complete; we watch and merge
  const handleInspect = (batch) => {
    setActiveBatch(batch);
    navigate(`/inspect/new?batchId=${batch.id}&type=${batch.inspectionType || "feed"}`);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#ede7db] dark:bg-[#050706] antialiased">
      {/* Shared farm BG */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden bg-[#faf7f0] dark:bg-[#0a0c0b]">
          <img
            id="bg-image-batches"
            src="/bg-farm.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.32 }}
          />
          <div className="absolute inset-0 bg-[#faf7f0]/60 dark:bg-[#0a0c0b]/72 pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-transparent border-x border-[#ded6c7] dark:border-[#1d221f]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.batchesPageTitle || "साइलेज व चारा लॉट्स"}
          subtitle={t.batchesPageSub || "कुल भंडारित स्टॉक व आयु ट्रैकिंग"}
          backTo="/dashboard"
        />

        {/* Batch List */}
        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
              {t.batchesPageTitle || "सिलेज / चारा बैच"}
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95 flex items-center gap-1"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>{(t.addBatchBtn || "नया बैच").replace("+", "").trim()}</span>
            </button>
          </div>

          {batches.map((batch) => {
            const displayLabel = batch.customLabel || t[batch.labelKey] || batch.labelKey;
            const displayType = t[batch.typeKey] || batch.typeKey;
            const displayStorage = t[batch.storageKey] || batch.storageKey;
            const displayStatus = t[batch.statusKey] || batch.statusKey;
            const ageDays = getBatchAgeDays(batch);

            return (
              <div
                key={batch.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#161c18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#0f1a12] border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center shrink-0 mt-0.5">
                      {batch.inspectionType === "silage" || batch.typeKey === "batchTypeCorn" ? (
                        <CornIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <GrainIcon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#064d2c] dark:text-white">
                        {displayLabel}
                      </h3>
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        {displayType}
                      </span>
                      <span className="block mt-1 text-[10px] font-mono text-gray-500 dark:text-gray-400">Batch ID: {batch.id}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold ${batch.statusColor}`}>
                    {displayStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#ded5c2] dark:border-[#242824]">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                      {t.batchAgeLabel || "भंडारण आयु:"}
                    </span>
                    <div className="text-xs font-black text-[#064d2c] dark:text-white mt-0.5">
                      {ageDays} {t.daysUnit || "दिन"}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#ded5c2] dark:border-[#242824]">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                      {t.batchQtyAvailLabel || "उपलब्ध मात्रा:"}
                    </span>
                    <div className="text-xs font-black text-[#064d2c] dark:text-white mt-0.5">
                      {batch.quantityKg.toLocaleString()} {t.kgUnit || "कि.ग्रा."}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    {displayStorage}
                  </span>
                  <button
                    onClick={() => handleInspect(batch)}
                    className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-[#161914] text-emerald-800 dark:text-[#86efac] text-xs font-bold border border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-[#20402e] cursor-pointer"
                  >
                    {t.inspectBatchBtn || "जाँचें →"}
                  </button>
                </div>
              </div>
            );
          })}
        </main>

        {/* Add Batch Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F0] dark:bg-[#16201a] w-full max-w-sm rounded-3xl p-5 border border-[#ded5c2] dark:border-[#242824] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#ded5c2] dark:border-[#242824]">
                <h3 className="text-sm font-black text-[#064d2c] dark:text-white">
                  {t.addBatchBtn || "नया चारा/साइलेज बैच"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                  className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
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
                    placeholder={t.batchPlaceholder || "जैसे: गड्ढा #2 मक्का साइलेज"}
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.batchTypeLabel || "चारे का प्रकार"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "batchTypeCorn",    label: t.batchTypeCorn    || "मक्का साइलेज",   icon: <CornIcon  className="w-6 h-6" />, silage: true  },
                      { key: "batchTypeSorghum", label: t.batchTypeSorghum || "ज्वार हरा चारा",  icon: <GrainIcon className="w-6 h-6" />, silage: false },
                      { key: "batchTypeBerseem", label: t.batchTypeBerseem || "बरसीम हरा चारा", icon: <GrainIcon className="w-6 h-6" />, silage: false },
                      { key: "batchTypeStraw",   label: t.batchTypeStraw   || "गेहूं सूखा भूसा", icon: <GrainIcon className="w-6 h-6" />, silage: false },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setNewBatchTypeKey(opt.key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          newBatchTypeKey === opt.key
                            ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                            : "bg-white dark:bg-[#0f1411] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#242824]"
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.batchQtyLabel || "अनुमानित मात्रा (कि.ग्रा.)"}
                  </label>
                  <input
                    type="number"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
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
