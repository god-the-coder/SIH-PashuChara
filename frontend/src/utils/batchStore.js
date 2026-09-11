const STORAGE_KEY = "pashuchaara_batches";
const REPORTS_KEY = "pashuchaara_batch_reports";

const SEED_BATCHES = [
  {
    id: "PC-9482", batchNumber: "BN-2026-001", labelKey: "batchPit1Corn", customLabel: "",
    typeKey: "batchTypeCorn", typeLabel: "Corn Silage", inspectionType: "silage",
    storageKey: "storageBunkerPit", createdAt: "2026-08-20T00:00:00", quantityKg: 5200,
    statusKey: "batchMature", statusColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300", lastInspectionRisk: "low",
    scanHistory: [{ date: "02 Sep 2026", moisture: "63.1%", ph: "4.3", qualityScore: "B+", statusKey: "batchMature" }, { date: "11 Sep 2026", moisture: "62.4%", ph: "4.1", qualityScore: "A", statusKey: "batchMature" }],
  },
  {
    id: "PC-9411", batchNumber: "BN-2026-002", labelKey: "batchLot4Sorghum", customLabel: "",
    typeKey: "batchTypeSorghum", typeLabel: "Sorghum Green Fodder", inspectionType: "feed",
    storageKey: "storageCoveredShed", createdAt: "2026-09-09T00:00:00", quantityKg: 1800,
    statusKey: "batchInUse", statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300", lastInspectionRisk: "medium",
    scanHistory: [{ date: "09 Sep 2026", moisture: "71.0%", ph: "5.8", qualityScore: "B", statusKey: "batchInUse" }],
  },
];

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function getBatches() {
  const batches = read(STORAGE_KEY, null);
  if (Array.isArray(batches)) return batches;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BATCHES));
  return SEED_BATCHES;
}

export function saveBatches(batches) { localStorage.setItem(STORAGE_KEY, JSON.stringify(batches)); }
export function getBatchById(id) { return getBatches().find((batch) => batch.id === id) || null; }

export function getBatchAgeDays(batch) {
  if (!batch?.createdAt) return batch?.ageDays ?? 0;
  const created = new Date(batch.createdAt);
  const today = new Date();
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - created) / 86400000));
}

export function setActiveBatch(batch) {
  sessionStorage.setItem("pashuchaara_active_batch_id", batch.id);
  sessionStorage.setItem("pashuchaara_active_batch", JSON.stringify(batch));
}
export function getActiveBatch() { return read("pashuchaara_active_batch", null); }

export function saveBatchAnalysis(batchId, answers) {
  const batch = getBatchById(batchId);
  if (!batch) return null;
  const now = new Date();
  const report = {
    batchId,
    analyzedAt: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    analyzedTime: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    answers,
  };
  const reports = read(REPORTS_KEY, {});
  reports[batchId] = report;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  const newScan = { date: report.analyzedAt, moisture: "—", ph: "—", qualityScore: "Pending", statusKey: batch.statusKey };
  saveBatches(getBatches().map((item) => item.id === batchId ? { ...item, lastAnalyzedAt: report.analyzedAt, scanHistory: [newScan, ...(item.scanHistory || [])].slice(0, 2) } : item));
  return report;
}

export function getBatchReport(batchId) { return read(REPORTS_KEY, {})[batchId] || null; }
