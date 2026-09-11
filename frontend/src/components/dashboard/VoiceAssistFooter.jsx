import { useDashboard } from "../../context/DashboardContext";

export default function VoiceAssistFooter() {
  const { t, isVoiceOn, toggleVoice } = useDashboard();
  return (
    <footer className="mt-4 mb-2 pb-2 flex items-center justify-center">
      <button
        id="voiceAssistBtn"
        aria-label="Toggle Voice Assist"
        onClick={toggleVoice}
        className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-black shadow-lg transition-all cursor-pointer backdrop-blur-md ${
          isVoiceOn
            ? "bg-[#0c2415]/90 border-[#1b5233] text-[#86efac]"
            : "bg-[#16201a]/90 border-white/20 text-gray-400"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isVoiceOn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isVoiceOn ? "bg-[#4ade80]" : "bg-gray-400"}`} />
        </span>
        <span className="text-sm">🎙️</span>
        <span>{isVoiceOn ? t.voiceAssistOn : t.voiceAssistOff}</span>
      </button>
    </footer>
  );
}
