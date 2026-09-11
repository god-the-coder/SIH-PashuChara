import { useEffect, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import farmService from "../../services/farm/farmService";

export default function WeatherStatusCard() {
  const { t, greetingName } = useDashboard();
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(() => !navigator.geolocation);

  useEffect(() => {
    if (!navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        farmService
          .getCurrentWeather(position.coords.latitude, position.coords.longitude)
          .then((data) => {
            if (!cancelled) setWeather(data);
          })
          .catch(() => {
            if (!cancelled) setError(true);
          });
      },
      () => {
        if (!cancelled) setError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const tempLabel = weather ? `${Math.round(weather.temperature_celsius)} C` : error ? "-" : "...";
  const humidityLabel = weather ? `${Math.round(weather.humidity_percent)}%` : error ? "-" : "...";
  const conditionLabel = weather ? (weather.condition || t.metricConditionVal) : error ? "-" : "...";

  return (
    <section>
      <div
        className="rounded-2xl px-4 py-3.5 text-white relative overflow-hidden shadow-xl"
        style={{ background: "linear-gradient(135deg, #093d22 0%, #0b5c31 55%, #0d7a40 100%)", border: "1px solid rgba(52,212,144,0.20)" }}
      >
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-[11px] font-medium text-emerald-200/80 tracking-wide uppercase">{t.greetingText}</p>
            <h2 className="text-xl font-black tracking-tight text-white mt-0.5">{greetingName}</h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300" style={{ background: "rgba(16,185,106,0.15)", border: "1px solid rgba(74,222,128,0.35)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.aiActiveBadge}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 relative z-10">
          {[
            { val: tempLabel, label: t.metricTemp },
            { val: humidityLabel, label: t.metricHumidity },
            { val: conditionLabel, label: t.metricWeatherLabel },
          ].map((m, i) => (
            <div key={i} className="px-2.5 py-2.5 rounded-xl flex flex-col" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <span className="text-base font-black text-white leading-tight">{m.val}</span>
              <span className="text-[10px] font-medium text-emerald-200/70 mt-0.5">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
