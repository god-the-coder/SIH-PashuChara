import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import BottomNavBar from "../components/layout/BottomNavBar";
import { PhoneIcon, SmartphoneIcon, ChatIcon, MicIcon, RefreshIcon, SendIcon, EditIcon, CheckIcon } from "../components/common/Icons";

export default function SupportPage() {
  const navigate = useNavigate();
  const { t, showToast } = useDashboard();

  // Issue Form State
  const [issueCategory, setIssueCategory] = useState("चारा गुणवत्ता व फफूंद");
  const [issueText, setIssueText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice Message State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [hasRecordedVoice, setHasRecordedVoice] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordSeconds(0);
    setHasRecordedVoice(false);
    showToast("आवाज़ रिकॉर्डिंग शुरू... अपनी समस्या बोलें");
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    setHasRecordedVoice(true);
    showToast("आवाज़ संदेश रिकॉर्ड हो गया (0:" + (recordSeconds < 10 ? "0" : "") + recordSeconds + ")");
  };

  const handleSendVoiceMessage = () => {
    setHasRecordedVoice(false);
    setRecordSeconds(0);
    showToast("वॉयस संदेश सहायता केंद्र को भेज दिया गया!");
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueText.trim()) {
      showToast("कृपया अपनी समस्या का विवरण लिखें");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIssueText("");
      showToast("समस्या टिकट #TKT-8492 दर्ज हो गया! 24 घंटे में समाधान मिलेगा");
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        {/* Unified SubPageHeader with language switcher */}
        <SubPageHeader
          title={t.supportPageTitle || t.menuSupportTitle || "सहायता व संपर्क"}
          subtitle={t.supportPageSub || "टोल-फ्री हेल्पलाइन, समस्या निवारण व वॉयस संदेश"}
          backTo="/dashboard"
        />

        {/* Content */}
        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* SECTION 1: Toll-Free & Customer Care Phone Cards */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider px-1 flex items-center gap-1.5">
              <PhoneIcon className="w-3.5 h-3.5" />
              <span>{t.helplineSectionTitle || "किसान हेल्पलाइन नंबर (Helplines)"}</span>
            </h3>

            {/* 1. Toll Free Number */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-[#161914] text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/50">
                  <PhoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    {t.tollFreeLabel || "टोल-फ्री नंबर (Toll-Free • निःशुल्क)"}
                  </span>
                  <div className="text-base font-black text-[#064d2c] dark:text-white">
                    {t.tollFreeNumber || "1800-180-1551"}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {t.tollFreeDesc || "किसान कॉल सेंटर (भारत सरकार) • 24x7 उपलब्ध"}
                  </p>
                </div>
              </div>
              <a
                href="tel:18001801551"
                className="px-3.5 py-2 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{t.callBtn || "कॉल"}</span>
                <PhoneIcon className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 2. Customer Care Number */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-[#251f15] text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-200/50">
                  <SmartphoneIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                    {t.customerCareLabel || "कस्टमर केयर व व्हाट्सएप (Support Care)"}
                  </span>
                  <div className="text-base font-black text-[#064d2c] dark:text-white">
                    {t.customerCareNumber || "+91 1800-889-4040"}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    {t.customerCareDesc || "पशु पोषण विशेषज्ञ व तकनीकी सहायता"}
                  </p>
                </div>
              </div>
              <a
                href="tel:18008894040"
                className="px-3.5 py-2 rounded-xl bg-[#143c20] hover:bg-[#0f2d18] text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{t.callBtn || "कॉल"}</span>
                <ChatIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* SECTION 2: Voice Message Sending Option */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-[#152618] dark:to-[#222116] border border-[#d2e0d4] dark:border-[#334636] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-[#1f2820] flex items-center justify-center shrink-0">
                  <MicIcon className="w-4 h-4 text-[#064d2c] dark:text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#064d2c] dark:text-white">
                    {t.voiceMessageTitle || "आवाज़ संदेश भेजें (Voice Message)"}
                  </h4>
                  <p className="text-[10px] text-gray-600 dark:text-gray-300">
                    {t.voiceMessageSub || "लिखने में कठिनाई हो तो बोलकर ऑडियो संदेश भेजें"}
                  </p>
                </div>
              </div>
              {isRecording && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  0:{recordSeconds < 10 ? "0" : ""}{recordSeconds}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              {!isRecording && !hasRecordedVoice && (
                <button
                  type="button"
                  onClick={handleStartRecord}
                  className="w-full py-2.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <MicIcon className="w-4 h-4" />
                  <span>{t.startRecordBtn || "आवाज़ रिकॉर्ड शुरू करें"}</span>
                </button>
              )}

              {isRecording && (
                <button
                  type="button"
                  onClick={handleStopRecord}
                  className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                >
                  <span className="w-3 h-3 rounded-xs bg-white" />
                  <span>{t.stopRecordBtn || "रिकॉर्डिंग रोकें (Stop)"}</span>
                </button>
              )}

              {hasRecordedVoice && (
                <div className="w-full flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartRecord}
                    className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                    <RefreshIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSendVoiceMessage}
                    className="flex-1 py-2 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{t.sendVoiceNoteBtn || "वॉयस संदेश भेजें (Send Voice Note)"}</span>
                    <SendIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Write or Address Issue Form */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
              <EditIcon className="w-3.5 h-3.5" />
              <span>{t.writeIssueTitle || "समस्या दर्ज करें (Address Issue / Write Query)"}</span>
            </h3>

            <form onSubmit={handleIssueSubmit} className="space-y-3">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.issueCategoryLabel || "समस्या का प्रकार (Category)"}
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                >
                  <option value="चारा गुणवत्ता व फफूंद">{t.issueCatReport || "चारा गुणवत्ता व फफूंद पहचान (Silage & Mold)"}</option>
                  <option value="पशु स्वास्थ्य व आहार सलाह">{t.issueCatDoctor || "पशु स्वास्थ्य व आहार सलाह (Animal Diet)"}</option>
                  <option value="मोबाइल ऐप तकनीकी सहायता">{t.issueCatApp || "मोबाइल ऐप तकनीकी सहायता (App Technical)"}</option>
                  <option value="अन्य सामान्य प्रश्न">{t.issueCatOther || "अन्य सामान्य प्रश्न (Other Query)"}</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.issueDescLabel || "अपनी समस्या या प्रश्न लिखें (Describe Issue) *"}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t.issueDescPlaceholder || "कृपया अपने चारे की स्थिति या आने वाली समस्या का विवरण यहाँ लिखें..."}
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
              >
                <span>{isSubmitting ? (t.listeningText || "कृपया प्रतीक्षा करें...") : (t.submitIssueBtn || "शिकायत / प्रश्न दर्ज करें")}</span>
                <CheckIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
