import { useDashboard } from "../../context/DashboardContext";

export default function RecordsSection({ onBatches, onHistory }) {
  const { t } = useDashboard();
  return (
    <section className="mt-4 mb-2">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-sm font-black text-[#14351d] dark:text-white">
          {t.recordsHeaderTitle}
        </span>
        <span className="text-[11px] font-bold text-[#4ade80] flex items-center gap-1 bg-[#112f1e]/90 px-3 py-0.5 rounded-full border border-emerald-700/50 shadow-sm">
          <span>{t.autoSyncedLabel}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Batches card */}
        <button
          id="btnMyBatches"
          onClick={onBatches}
          className="relative p-3.5 rounded-3xl bg-[#fcf9f2] dark:bg-[#102217] border border-[#e3dbcb] dark:border-[#1e3b2a] shadow-lg text-left flex flex-col justify-between transition-transform active:scale-[0.98] cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#1a3324] text-[#13381e] dark:text-[#a7f3d0] flex items-center justify-center text-lg border border-emerald-200/50 dark:border-emerald-700/40">
                📦
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-[#1a402a] text-[#144222] dark:text-[#86efac] text-[10px] font-black">
                {t.batchBadgeCount}
              </span>
            </div>
            <h3 className="text-sm font-black text-[#152b1b] dark:text-white">
              {t.batchCardTitle}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              {t.batchCardDesc}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ede3d3] dark:border-white/10 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-[#86efac]">
            <span>{t.batchCardLink}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </div>
        </button>

        {/* History card */}
        <button
          id="btnInspectionHistory"
          onClick={onHistory}
          className="relative p-3.5 rounded-3xl bg-[#fcf9f2] dark:bg-[#102217] border border-[#e3dbcb] dark:border-[#1e3b2a] shadow-lg text-left flex flex-col justify-between transition-transform active:scale-[0.98] cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-[#2d2116] text-amber-700 dark:text-[#fcd34d] flex items-center justify-center text-lg border border-amber-200/50 dark:border-amber-700/40">
                📋
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-[#382b1d] text-amber-900 dark:text-[#fcd34d] text-[10px] font-black">
                {t.historyBadgeCount}
              </span>
            </div>
            <h3 className="text-sm font-black text-[#152b1b] dark:text-white">
              {t.historyCardTitle}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
              {t.historyCardDesc}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#ede3d3] dark:border-white/10 flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-[#fcd34d]">
            <span>{t.historyCardLink}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </div>
        </button>
      </div>
    </section>
  );
}
