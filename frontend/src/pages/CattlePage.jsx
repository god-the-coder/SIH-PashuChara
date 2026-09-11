import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import BottomNavBar from "../components/layout/BottomNavBar";

const COW_BREEDS = ["साहीवाल (Sahiwal)", "गिर (Gir)", "राठी (Rathi)", "थारपारकर (Tharparkar)", "एचएफ क्रॉस (HF Cross)", "जर्सी (Jersey)"];
const BUFFALO_BREEDS = ["मुर्राह (Murrah)", "जाफराबादी (Jaffarabadi)", "नीली रावी (Nili Ravi)", "भदावरी (Bhadawari)"];
const GOAT_BREEDS = ["बरबरी (Barbari)", "सिरोही (Sirohi)", "जमुनापारी (Jamunapari)", "बीटल (Beetal)"];

export default function CattlePage() {
  const navigate = useNavigate();
  const { t, user, showToast } = useDashboard();

  const [cattleList, setCattleList] = useState(
    user?.cattleDetails && user.cattleDetails.length > 0
      ? user.cattleDetails
      : [
          { id: "c-1", category: "cow", breed: "साहीवाल (Sahiwal)", count: 8, milkLiters: 120, lactationStage: "दुधारू" },
          { id: "c-2", category: "cow", breed: "गिर (Gir)", count: 4, milkLiters: 65, lactationStage: "दुधारू" },
          { id: "c-3", category: "buffalo", breed: "मुर्राह (Murrah)", count: 12, milkLiters: 160, lactationStage: "दुधारू" },
        ]
  );

  const [isListening, setIsListening] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // New Cattle State
  const [newCattle, setNewCattle] = useState({
    category: "cow",
    breed: "साहीवाल (Sahiwal)",
    count: 4,
    milkLiters: 50,
    lactationStage: "दुधारू",
  });

  // Simulated Voice Dictation for Cattle Details
  const handleVoiceFill = () => {
    setIsListening(true);
    showToast("🎙️ पशु विवरण सुन रहे हैं... गाय/भैंस, नस्ल और संख्या बोलें");
    setTimeout(() => {
      setIsListening(false);
      const voiceAdded = {
        id: `c-${Date.now()}`,
        category: "cow",
        breed: "गिर (Gir)",
        count: 6,
        milkLiters: 90,
        lactationStage: "दुधारू",
      };
      const updated = [...cattleList, voiceAdded];
      setCattleList(updated);
      showToast("✓ बोलकर 6 गिर गायें सफलतापूर्वक जोड़ी गईं!");
    }, 1900);
  };

  const handleAddCattle = (e) => {
    e.preventDefault();
    const entry = {
      id: `c-${Date.now()}`,
      ...newCattle,
      count: Number(newCattle.count) || 1,
      milkLiters: Number(newCattle.milkLiters) || 0,
    };
    const updated = [...cattleList, entry];
    setCattleList(updated);
    setModalOpen(false);
    showToast("नया पशु रिकॉर्ड सफलतापूर्वक जोड़ा गया! 🐄");
  };

  const handleRemove = (id) => {
    const updated = cattleList.filter((c) => c.id !== id);
    setCattleList(updated);
    showToast("पशु रिकॉर्ड हटाया गया");
  };

  const totalCattleCount = cattleList.reduce((sum, c) => sum + Number(c.count), 0);
  const totalMilk = cattleList.reduce((sum, c) => sum + Number(c.milkLiters), 0);
  const dailyFodderKg = totalCattleCount * 20;

  const currentBreeds =
    newCattle.category === "cow"
      ? COW_BREEDS
      : newCattle.category === "buffalo"
      ? BUFFALO_BREEDS
      : GOAT_BREEDS;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        {/* Unified SubPageHeader with language switcher */}
        <SubPageHeader
          title={t.cattlePageTitle || t.menuCattleInfoTitle || "पशुधन जानकारी"}
          subtitle={t.cattlePageSub || "नस्ल विकल्प, संख्या व दैनिक चारा अनुपात"}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => setModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-xs cursor-pointer transition-transform active:scale-95"
            >
              {t.addNewCattleBtn || "+ नया पशु"}
            </button>
          }
        />

        {/* Content */}
        <main className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <span className="text-xl font-black text-[#064d2c] dark:text-white block">
                {totalCattleCount}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                {t.totalCattleMetric || t.totalCattleLabel || "कुल पशु 🐄"}
              </span>
            </div>
            <div className="p-3 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <span className="text-xl font-black text-[#064d2c] dark:text-white block">
                {totalMilk} L
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                {t.dailyMilkMetric || t.milkingCattleLabel || "दैनिक दूध 🥛"}
              </span>
            </div>
            <div className="p-3 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <span className="text-xl font-black text-[#064d2c] dark:text-white block">
                {dailyFodderKg} kg
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                {t.fodderConsumptionMetric || t.dailyFodderLabel || "चारा खपत 🌾"}
              </span>
            </div>
          </div>

          {/* Voice Input Action Card */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-[#16291b] dark:to-[#222116] border border-[#d2e0d4] dark:border-[#334636] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-pulse">🎙️</span>
              <div>
                <span className="text-xs font-black text-[#064d2c] dark:text-white block">
                  {t.voiceFillBannerTitle || "बोलकर पशु विवरण जोड़ें"}
                </span>
                <span className="text-[10px] text-gray-600 dark:text-gray-300">
                  {t.voiceFillBannerSub || "गाय, भैंस, नस्ल व संख्या बोलें"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVoiceFill}
              className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-[#2D5A3D] hover:bg-[#1E442B] text-white"
              }`}
            >
              {isListening ? (t.listeningText || "सुन रहे हैं...") : (t.speakBtnText || "बोलें 🎙️")}
            </button>
          </div>

          {/* Cattle List by Breeds */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider px-1">
              {t.registeredBreedsTitle || "पंजीकृत पशु व नस्लें (Registered Breeds)"}
            </h3>

            {cattleList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#faf7f0] dark:bg-[#0f1411] border border-[#ded5c2] dark:border-[#242824] flex items-center justify-center text-xl shrink-0">
                    {item.category === "cow" ? "🐄" : item.category === "buffalo" ? "🐃" : "🐐"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-[#064d2c] dark:text-white">
                        {item.breed}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-[#1b3d27] text-emerald-800 dark:text-[#86efac] text-[9px] font-black">
                        {item.count} {t.cattleCow?.split(" ")[0] || "पशु"}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.lactationStage || t.cattleStatusLactating} • ~{item.milkLiters} {t.milkPerDayUnit || "ली/दिन"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label="Remove cattle"
                  className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xs hover:bg-red-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Feeding Advice */}
          <div className="p-4 rounded-3xl bg-[#0f3821] text-white shadow-md border border-emerald-600/30 space-y-2">
            <span className="text-xs font-black uppercase text-emerald-300 tracking-wider block">
              {t.breedFeedingAdviceTitle || "📊 नस्ल अनुसार आहार आवश्यकता"}
            </span>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {t.breedFeedingAdviceText || "गिर और साहीवाल गायों के लिए प्रति पशु 18-22 कि.ग्रा. साइलेज व 4 कि.ग्रा. दाना मिश्रण अनुशंसित है।"}
            </p>
          </div>
        </main>

        {/* Add Cattle Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF7F0] dark:bg-[#16201a] w-full max-w-sm rounded-3xl p-5 border border-[#ded5c2] dark:border-[#242824] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#ded5c2] dark:border-[#242824]">
                <h3 className="text-sm font-black text-[#064d2c] dark:text-white">
                  {t.addCattleModalTitle || "नया पशु विवरण जोड़ें"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCattle} className="mt-3 space-y-3">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.cattleTypeLabel || "1. पशु का प्रकार (Type of Cattle)"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "cow", label: t.cattleCow || "गाय 🐄" },
                      { id: "buffalo", label: t.cattleBuffalo || "भैंस 🐃" },
                      { id: "goat", label: t.cattleGoat || "बकरी 🐐" },
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => {
                          const breeds = cat.id === "cow" ? COW_BREEDS : cat.id === "buffalo" ? BUFFALO_BREEDS : GOAT_BREEDS;
                          setNewCattle({ ...newCattle, category: cat.id, breed: breeds[0] });
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          newCattle.category === cat.id
                            ? "bg-[#2D5A3D] text-white border-[#2D5A3D] shadow-xs"
                            : "bg-white dark:bg-[#0f1411] text-gray-700 dark:text-gray-300 border-[#ded5c2] dark:border-[#242824]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Breed options */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.cattleBreedLabel || "2. नस्ल का चयन (Breed Option)"}
                  </label>
                  <select
                    value={newCattle.breed}
                    onChange={(e) => setNewCattle({ ...newCattle, breed: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                  >
                    {currentBreeds.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Count & Milk */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.cattleCountSubLabel || "3. संख्या (Count)"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newCattle.count}
                      onChange={(e) => setNewCattle({ ...newCattle, count: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.cattleMilkYieldLabel || "4. दूध (Liters/day)"}
                    </label>
                    <input
                      type="number"
                      value={newCattle.milkLiters}
                      onChange={(e) => setNewCattle({ ...newCattle, milkLiters: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    {t.cancel || "रद्द करें"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    {t.saveCattleBtn || "पशु रिकॉर्ड जोड़ें"}
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
