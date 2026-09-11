import { useDashboard } from "../../context/DashboardContext";

const LeafIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const GrainIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4 stroke-white stroke-[2.5]" fill="none" viewBox="0 0 24 24">
    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function SilageCard({ onSilage }) {
  const { t } = useDashboard();
  return (
    <button
      id="btnCheckSilage"
      onClick={onSilage}
      className="w-full relative px-4 py-3 rounded-2xl text-white text-left cursor-pointer transition-all active:scale-[0.98] hover:brightness-110 shadow-lg hover:shadow-xl"
      style={{ background: "linear-gradient(135deg, #0a6e38 0%, #0d8f4a 50%, #10a855 100%)", border: "1px solid rgba(52,212,144,0.30)" }}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
      </div>
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <LeafIcon />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black tracking-tight text-white">{t.btnSilageTitle}</span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase" style={{ background: "rgba(255,255,255,0.15)", color: "#a7f3d0" }}>
                {t.btnSilageBadge}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/75 mt-0.5 truncate">{t.btnSilageSubtitle}</p>
          </div>
        </div>
        <div className="w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <ArrowIcon />
        </div>
      </div>
    </button>
  );
}

function FeedCard({ onFeed }) {
  const { t } = useDashboard();
  return (
    <button
      id="btnCheckFeed"
      onClick={onFeed}
      className="w-full relative px-4 py-3 rounded-2xl text-white text-left cursor-pointer transition-all active:scale-[0.98] hover:brightness-110 shadow-lg hover:shadow-xl"
      style={{ background: "linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #b45309 100%)", border: "1px solid rgba(251,191,36,0.25)" }}
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />
      </div>
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <GrainIcon />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black tracking-tight text-white">{t.btnFeedTitle}</span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase" style={{ background: "rgba(255,255,255,0.15)", color: "#fde68a" }}>
                {t.btnFeedBadge}
              </span>
            </div>
            <p className="text-[11px] text-amber-100/75 mt-0.5 truncate">{t.btnFeedSubtitle}</p>
          </div>
        </div>
        <div className="w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
          <ArrowIcon />
        </div>
      </div>
    </button>
  );
}

export default function ActionCards({ onSilage, onFeed }) {
  return (
    <section className="flex flex-col gap-5">
      <SilageCard onSilage={onSilage} />
      <FeedCard onFeed={onFeed} />
    </section>
  );
}
