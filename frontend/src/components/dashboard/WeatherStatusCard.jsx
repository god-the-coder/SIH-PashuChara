import { useDashboard } from "../../context/DashboardContext";

export default function WeatherStatusCard() {
  const { t } = useDashboard();
  return (
    <section className="mt-1">
      <div className="rounded-3xl p-4 bg-[#0d2a1b] text-white shadow-xl border border-[#1b5235]/60 relative overflow-hidden">
        {/* Subtle ambient light */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Greeting row */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-xs font-medium text-[#a3cfbb] tracking-wide">{t.greetingText}</p>
            <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">{t.farmerGreetingName}</h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0e3b24] border border-[#1b5235] text-[11px] font-bold text-[#4ade80]">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span>{t.aiActiveBadge}</span>
          </div>
        </div>

        {/* Environmental metrics */}
        <div className="grid grid-cols-3 gap-2.5 mt-3.5 relative z-10">
          <div className="p-3 rounded-2xl bg-[#133824] border border-[#1b5235]/40 flex flex-col justify-center">
            <span className="text-lg font-black text-white leading-tight">28°C</span>
            <span className="text-[11px] font-medium text-[#a3cfbb] mt-0.5">{t.metricTemp}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#133824] border border-[#1b5235]/40 flex flex-col justify-center">
            <span className="text-lg font-black text-white leading-tight">64%</span>
            <span className="text-[11px] font-medium text-[#a3cfbb] mt-0.5">{t.metricHumidity}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#133824] border border-[#1b5235]/40 flex flex-col justify-center">
            <span className="text-lg font-black text-white leading-tight">{t.metricConditionVal}</span>
            <span className="text-[11px] font-medium text-[#a3cfbb] mt-0.5">{t.metricWeatherLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
