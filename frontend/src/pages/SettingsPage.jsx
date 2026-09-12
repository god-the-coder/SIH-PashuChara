import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import BottomNavBar from "../components/layout/BottomNavBar";
import { SUPPORTED_LANGUAGES, translations } from "../constants/translations";
import { SunIcon, MoonIcon, UsersIcon, SettingsIcon, BroomIcon, TrashIcon, AlertTriangleIcon, CloseIcon, CheckIcon } from "../components/common/Icons";

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
    user,
    login,
    showToast,
  } = useDashboard();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");

  const handleAddNewUser = (e) => {
    e.preventDefault();
    if (!newUserName) return;
    login({
      name: newUserName,
      isCustomName: true,
      phone: newUserPhone || "9876500000",
      role: "डेयरी किसान",
      age: "38",
      cattleCount: 12,
      location: "आनंद, गुजरात",
    });
    setNewUserModalOpen(false);
    setNewUserName("");
    setNewUserPhone("");
    showToast(`नया उपयोगकर्ता "${newUserName}" सक्रिय किया गया!`);
  };

  const demoProfiles = [
    { name: "रमेश चौधरी", label: "रमेश चौधरी (Ramesh Choudhary)", phone: "9876543210", cattle: 24, location: "करनाल, हरियाणा", isCustom: false },
    { name: "सुरेश पटेल", label: "सुरेश पटेल (Suresh Patel)", phone: "9428011223", cattle: 18, location: "आनंद, गुजरात", isCustom: true },
    { name: "राजेश कुमार", label: "राजेश कुमार (Rajesh Kumar)", phone: "9812345678", cattle: 12, location: "लुधियाना, पंजाब", isCustom: true },
  ];

  const handleSwitchToDemoUser = (profile) => {
    login({
      name: profile.name,
      isCustomName: profile.isCustom,
      phone: profile.phone,
      role: "डेयरी किसान",
      age: "42",
      cattleCount: profile.cattle,
      location: profile.location,
    });
    showToast(`उपयोगकर्ता बदलकर "${profile.name}" किया गया!`);
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
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
              <SunIcon className="w-3.5 h-3.5" />
              <span>{t.appearanceSectionTitle || "डिस्प्ले व थीम (Appearance)"}</span>
            </h3>

            {/* Dark / Light Mode Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="text-xs font-bold text-[#064d2c] dark:text-white block">
                  {t.themeModeLabel || "डार्क / लाइट मोड (Screen Theme)"}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  {isDark ? (
                    <>
                      <span>डार्क थीम सक्रिय</span>
                      <MoonIcon className="w-3 h-3 text-emerald-600" />
                    </>
                  ) : (
                    <>
                      <span>लाइट थीम सक्रिय</span>
                      <SunIcon className="w-3 h-3 text-amber-500" />
                    </>
                  )}
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

          {/* SECTION 2: User Profiles & Switcher */}
          <div className="bg-white dark:bg-[#181e18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
                <UsersIcon className="w-3.5 h-3.5" />
                <span>{t.userManagementTitle || "उपयोगकर्ता प्रबंधन (User Accounts)"}</span>
              </h3>
              <button
                onClick={() => setNewUserModalOpen(true)}
                className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t.addNewUserBtn || "+ नया जोड़ें"}
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#2D5A3D] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2D5A3D] text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || "R"}
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#064d2c] dark:text-white block">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>सक्रिय प्रोफ़ाइल</span>
                      <CheckIcon className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {availableProfiles
                .filter((p) => p.name !== displayName)
                .map((profile) => (
                  <div
                    key={profile.id}
                    className="p-3 rounded-2xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#ded5c2] dark:border-[#242824] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-[#202822] text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-xs">
                        {profile.name[0]}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          {profile.name}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {profile.location} · {profile.cattleCount} पशु
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSwitchProfile(profile)}
                      className="px-3 py-1 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-[11px] font-bold shadow-xs cursor-pointer"
                    >
                      {t.switchUserBtn || "स्विच करें"}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* SECTION 3: Storage, Cache & Data Management */}
          <div className="bg-white dark:bg-[#181e18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider flex items-center gap-1.5">
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>{t.storageSectionTitle || "स्टोरेज व डेटा प्रबंधन (Storage & Data)"}</span>
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
                className="px-3.5 py-1.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-1"
              >
                <span>{t.clearCacheBtn || "साफ करें"}</span>
                <BroomIcon className="w-3.5 h-3.5" />
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
                className="px-3.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 cursor-pointer flex items-center gap-1"
              >
                <span>{t.deleteAccountBtn || "हटाएं"}</span>
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F0] dark:bg-[#16201a] w-full max-w-xs rounded-3xl p-5 border border-[#ded5c2] dark:border-[#242824] shadow-2xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <AlertTriangleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-[#064d2c] dark:text-white mt-2">
                {t.confirmDeleteTitle || "क्या आप डेटा हटाना चाहते हैं?"}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                {t.confirmDeleteText || "आपका प्रोफ़ाइल, चारा इतिहास और सभी पशु विवरण हमेशा के लिए हटा दिए जाएंगे।"}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  {t.cancel || "रद्द करें"}
                </button>
                <button
                  onClick={() => {
                    deleteAccount();
                    setDeleteConfirmOpen(false);
                    navigate("/login");
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {t.confirmDeleteBtn || "हाँ, हटाएं"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {newUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F0] dark:bg-[#16201a] w-full max-w-sm rounded-3xl p-5 border border-[#ded5c2] dark:border-[#242824] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#ded5c2] dark:border-[#242824]">
                <h3 className="text-sm font-black text-[#064d2c] dark:text-white">
                  {t.addUserModalTitle || "नया उपयोगकर्ता प्रोफाइल जोड़ें"}
                </h3>
                <button
                  onClick={() => setNewUserModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddNewUser} className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.newUserNameLabel || "किसान का नाम *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जैसे: विक्रम यादव"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.newUserPhoneLabel || "मोबाइल नंबर"}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10 अंकों का नंबर"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    {t.cancel || "रद्द करें"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {t.saveUserBtn || "उपयोगकर्ता जोड़ें"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
