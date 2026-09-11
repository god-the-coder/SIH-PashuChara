import { useDashboard } from "../../context/DashboardContext";

export default function VoiceAssistFooter() {
  const { t, isVoiceOn, toggleVoice } = useDashboard();
  return (
    <footer className="flex items-center justify-center">
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
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
        </svg>
        <span>{isVoiceOn ? t.voiceAssistOn : t.voiceAssistOff}</span>
      </button>
    </footer>
  );
}
