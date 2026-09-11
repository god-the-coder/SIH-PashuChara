import { useDashboard } from "../../context/DashboardContext";

export default function RecordsSection({ onBatches, onHistory }) {
  const { t } = useDashboard();
  return (
    <section>
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-sm font-black text-[#064d2c] dark:text-white">
          {t.recordsHeaderTitle}
        </span>
        <span className="text-[10px] font-bold text-[#10b96a] flex items-center gap-1 bg-[#064d2c]/10 dark:bg-[#10b96a]/10 px-2.5 py-0.5 rounded-full border border-[#10b96a]/30">
          <span>{t.autoSyncedLabel}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
          </svg>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {/* Batches card */}
        <button
          id="btnMyBatches"
          onClick={onBatches}
          className="relative p-3.5 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer hover:shadow-lg"
          style={{ background: "linear-gradient(145deg, #f5fdf8, #eafaf2)", border: "1px solid rgba(16,185,106,0.20)" }}
        >
          <div>
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#065f36] text-[10px] font-black border border-emerald-200/60">
                {t.batchBadgeCount}
              </span>
            </div>
            <h3 className="text-sm font-black text-[#064d2c]">{t.batchCardTitle}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{t.batchCardDesc}</p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
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
          className="relative p-3.5 rounded-2xl text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer hover:shadow-lg"
          style={{ background: "linear-gradient(145deg, #fefbf3, #fef3cd)", border: "1px solid rgba(245,158,11,0.20)" }}
        >
          <div>
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#78350f] text-[10px] font-black border border-amber-200/60">
                {t.historyBadgeCount}
              </span>
            </div>
            <h3 className="text-sm font-black text-[#78350f]">{t.historyCardTitle}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{t.historyCardDesc}</p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
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
