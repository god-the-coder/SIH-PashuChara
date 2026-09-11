import { useDashboard } from "../../context/DashboardContext";

// Silage check card
function SilageCard({ onSilage }) {
  const { t } = useDashboard();
  return (
    <button
      id="btnCheckSilage"
      onClick={onSilage}
      className="w-full relative px-4 py-4 rounded-3xl bg-[#0f3821] text-white border border-[#1e5a37] shadow-lg text-left cursor-pointer transition-transform active:scale-[0.98] hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-[#17482c] border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
            🌽
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">{t.btnSilageTitle}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#1c5534] text-[#6ee7b7] text-[10px] font-black tracking-wider uppercase">
                {t.btnSilageBadge}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-1 truncate">{t.btnSilageSubtitle}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white text-[#0f3821] flex items-center justify-center shadow-md shrink-0 ml-2">
          <svg className="w-5 h-5 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// Feed check card
function FeedCard({ onFeed }) {
  const { t } = useDashboard();
  return (
    <button
      id="btnCheckFeed"
      onClick={onFeed}
      className="w-full relative px-4 py-4 rounded-3xl bg-[#482813] text-white border border-[#6b3e1f] shadow-lg text-left cursor-pointer transition-transform active:scale-[0.98] hover:shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-13 h-13 rounded-2xl bg-[#5c3419] border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
            🌾
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">{t.btnFeedTitle}</span>
              <span className="px-2 py-0.5 rounded-md bg-[#70421e] text-[#fcd34d] text-[10px] font-black tracking-wider uppercase">
                {t.btnFeedBadge}
              </span>
            </div>
            <p className="text-xs text-amber-100/80 mt-1 truncate">{t.btnFeedSubtitle}</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white text-[#482813] flex items-center justify-center shadow-md shrink-0 ml-2">
          <svg className="w-5 h-5 stroke-current stroke-[2.5]" fill="none" viewBox="0 0 24 24">
            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default function ActionCards({ onSilage, onFeed }) {
  return (
    <section className="my-2 flex flex-col gap-3">
      <SilageCard onSilage={onSilage} />
      <FeedCard onFeed={onFeed} />
    </section>
  );
}
