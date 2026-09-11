import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import BottomNavBar from "../components/layout/BottomNavBar";
import { SUPPORTED_LANGUAGES, translations } from "../constants/translations";

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    t,
    lang,
    changeLang,
    isDark,
    toggleDark,
    fontSize,
    setFontSize,
    clearCache,
    deleteAccount,
    logout,
    user,
    showToast,
  } = useDashboard();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleConfirmDelete = async () => {
    setDeleteError("");
    setIsDeleting(true);
    try {
      await deleteAccount();
      setDeleteConfirmOpen(false);
      navigate("/login");
    } catch (apiError) {
      setDeleteError(apiError.message || t.errRegisterFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        {/* Unified SubPageHeader with language switcher */}
        <SubPageHeader
          title={t.settingsPageTitle || t.menuSettingsTitle || "ऐप सेटिंग्स"}
          subtitle={t.settingsPageSub || "फॉन्ट, डेटा, थीम व उपयोगकर्ता प्रबंधन"}
          backTo="/dashboard"
        />

        {/* Content */}
        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* SECTION 1: Appearance & Display */}
          <div className="bg-white dark:bg-[#181e18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3.5">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
              {t.appearanceSectionTitle || "🖥️ डिस्प्ले व थीम (Appearance)"}
            </h3>

            {/* Dark / Light Mode Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-bold text-[#064d2c] dark:text-white block">
                  {t.themeModeLabel || "डार्क / लाइट मोड (Screen Theme)"}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {isDark ? "डार्क थीम सक्रिय 🌙" : "लाइट थीम सक्रिय ☀️"}
                </span>
              </div>
              <button
                id="settingsThemeToggle"
                onClick={toggleDark}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isDark ? "bg-[#2D5A3D]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Font Size Selector */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold text-[#064d2c] dark:text-white block mb-2">
                {t.fontSizeLabel || "फॉन्ट आकार (Text Font Size)"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "small", label: t.fontSmall || "छोटा (A-)", sub: "Compact" },
                  { id: "normal", label: t.fontNormal || "सामान्य (A)", sub: "Default" },
                  { id: "large", label: t.fontLarge || "बड़ा (A+)", sub: "Large" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFontSize(f.id);
                      showToast(`फॉन्ट आकार बदला: ${f.label}`);
                    }}
                    className={`py-2 px-1 rounded-2xl border text-center transition-all cursor-pointer ${
                      fontSize === f.id
                        ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                        : "bg-[#faf7f0] dark:bg-[#0f1411] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#242824]"
                    }`}
                  >
                    <span className="text-xs font-bold block">{f.label}</span>
                    <span className="text-[9px] opacity-75">{f.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold text-[#064d2c] dark:text-white block mb-2">
                {t.appLanguageLabel || "ऐप भाषा (Application Language)"}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {SUPPORTED_LANGUAGES.map((code) => (
                  <button
                    key={code}
                    onClick={() => changeLang(code)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      lang === code
                        ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                        : "bg-[#faf7f0] dark:bg-[#0f1411] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#242824]"
                    }`}
                  >
                    {translations[code]?.langLabel || code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: Account */}
          <div className="bg-white dark:bg-[#181e18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
              {t.userManagementTitle}
            </h3>

            {user?.isLoggedIn ? (
              <>
                <div className="p-3 rounded-2xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#2D5A3D] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#2D5A3D] text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#064d2c] dark:text-white block">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {user.phone}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">
                    {t.activeAccountTag}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  {t.drawerLogoutLabel}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold cursor-pointer"
              >
                {t.drawerLoginLabel}
              </button>
            )}
          </div>

          {/* SECTION 3: Storage, Cache & Data Management */}
          <div className="bg-white dark:bg-[#181e18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
              {t.storageSectionTitle || "💾 स्टोरेज व डेटा प्रबंधन (Storage & Data)"}
            </h3>

            {/* Clear Cache */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-bold text-[#064d2c] dark:text-white block">
                  {t.clearCacheTitle || "कैश साफ करें (Clear App Cache)"}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {t.clearCacheSub || "अस्थायी तस्वीरें व स्कैन डेटा हटाएं (~12 MB)"}
                </span>
              </div>
              <button
                onClick={clearCache}
                className="px-3.5 py-1.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer"
              >
                {t.clearCacheBtn || "साफ करें 🧹"}
              </button>
            </div>

            {/* Delete Account & Reset Data */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                  {t.deleteAccountTitle || "खाता व समस्त डेटा हटाएं (Delete Account)"}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {t.deleteAccountSub || "सभी रिकॉर्ड्स स्थायी रूप से हटा दिए जाएंगे"}
                </span>
              </div>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 cursor-pointer"
              >
                {t.deleteAccountBtn || "हटाएं 🗑️"}
              </button>
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F0] dark:bg-[#16201a] w-full max-w-xs rounded-3xl p-5 border border-[#ded5c2] dark:border-[#242824] shadow-2xl text-center">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-sm font-black text-[#064d2c] dark:text-white mt-2">
                {t.confirmDeleteTitle || "क्या आप डेटा हटाना चाहते हैं?"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                {t.confirmDeleteText || "आपका प्रोफ़ाइल, चारा इतिहास और सभी पशु विवरण हमेशा के लिए हटा दिए जाएंगे।"}
              </p>
              {deleteError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-2">{deleteError}</p>
              )}
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer disabled:opacity-60"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? t.savingBtn : t.confirmDeleteBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
