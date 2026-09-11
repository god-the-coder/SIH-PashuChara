import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { t, markAllRead } = useDashboard();

  const alerts = [
    {
      id: "alert-1",
      type: "weather",
      title: t.alert1Title || "बारिश व उच्च आर्द्रता चेतावनी (84% Humidity)",
      body: t.alert1Body || "स्थानीय मौसम में बारिश व उच्च सीलन दर्ज की गई है। खुले में रखे चारे में फफूंद पनपने का गंभीर खतरा है। कृपया तुरंत वाटरप्रूफ तिरपाल से कसकर ढकें।",
      time: t.alert1Time || "15 मिनट पहले",
      actionLabel: t.alert1Action || "चारे की स्थिति परखें",
      actionRoute: "/inspect/new?type=feed",
      colorClasses: "bg-amber-500/10 dark:bg-[#2d2319] border-amber-500/30",
      iconClasses: "bg-amber-500/20 text-amber-800 dark:text-[#fcd34d]",
      icon: "⚠️",
    },
    {
      id: "alert-2",
      type: "reminder",
      title: t.alert2Title || "साइलेज पिट #1 री-चेक अनुस्मारक",
      body: t.alert2Body || "साइलेज पिट #1 की पिछली जाँच को 4 दिन हो चुके हैं। उच्च पोषण व किण्वन सुरक्षा बनाए रखने के लिए दोबारा 4 तस्वीरों की त्वरित जाँच करें।",
      time: t.alert2Time || "2 घंटे पहले",
      actionLabel: t.alert2Action || "साइलेज जाँच करें",
      actionRoute: "/inspect/new?type=silage",
      colorClasses: "bg-emerald-500/10 dark:bg-[#161914] border-emerald-500/30",
      iconClasses: "bg-emerald-500/20 text-emerald-800 dark:text-[#86efac]",
      icon: "🌽",
    },
    {
      id: "alert-3",
      type: "info",
      title: t.alert3Title || "पशु पोषण टिप: मायकोटॉक्सिन से बचाव",
      body: t.alert3Body || "हल्की भी बदबूदार या काली फफूंद दिखने पर चारे के उस हिस्से को तुरंत अलग करें। दुधारू गायों को फफूंद युक्त चारा देने से दूध उत्पादन में 20% तक गिरावट आ सकती है।",
      time: t.alert3Time || "कल",
      actionLabel: null,
      actionRoute: null,
      colorClasses: "bg-blue-500/10 dark:bg-[#182736] border-blue-500/30",
      iconClasses: "bg-blue-500/20 text-blue-800 dark:text-[#93c5fd]",
      icon: "💡",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.notifModalTitle || "सूचनाएँ एवं अलर्ट"}
          subtitle="मौसम चेतावनी व साइलेज अनुस्मारक"
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {t.notifMarkReadBtn || "सभी पढ़ा"}
            </button>
          }
        />

        {/* Alerts List */}
        <main className="p-4 space-y-3 flex-1 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-3xl border ${alert.colorClasses} shadow-sm space-y-2`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-lg shrink-0 ${alert.iconClasses}`}>
                  {alert.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-[#064d2c] dark:text-white leading-tight">
                      {alert.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                    {alert.time}
                  </span>
                  <p className="text-xs text-gray-700 dark:text-[#d1d5db] mt-1 leading-snug">
                    {alert.body}
                  </p>
                </div>
              </div>

              {alert.actionLabel && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => navigate(alert.actionRoute)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>{alert.actionLabel}</span>
                    <span className="text-xs">→</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
