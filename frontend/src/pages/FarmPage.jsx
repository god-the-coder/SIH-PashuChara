import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function FarmPage() {
  const { t, showToast, user, displayName, displayLocation, updateProfile } = useDashboard();

  const [farmData, setFarmData] = useState({
    customFarmName: "",
    customLocation: "",
    customStorageType: "",
    totalCattle: user?.cattleCount || 24,
    milkingCows: Math.round((user?.cattleCount || 24) * 0.75),
    dailyFodderRequirementKg: (user?.cattleCount || 24) * 20,
  });

  const [isEditing, setIsEditing] = useState(false);

  const displayFarmName = farmData.customFarmName || t.defaultFarmName || "Ramchandra Dairy Farm";
  const farmLocation = farmData.customLocation || displayLocation;
  const displayStorageType = farmData.customStorageType || t.defaultStorageType || "Bunker Pit & Covered Shed";
  const displayOwner = displayName || user?.name || t.navFarmerName || "Ramesh Choudhary";

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    updateProfile({
      location: farmLocation,
      cattleCount: farmData.totalCattle,
    });
    showToast(t.farmUpdatedToast || "Farm details updated successfully! ✓");
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#ede7db] dark:bg-[#050706] antialiased">
      {/* Shared farm BG */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-full max-w-[430px] mx-auto overflow-hidden bg-[#faf7f0] dark:bg-[#0a0c0b]">
          <img
            id="bg-image-farm"
            src="/bg-farm.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: 0.32 }}
          />
          <div className="absolute inset-0 bg-[#faf7f0]/60 dark:bg-[#0a0c0b]/72 pointer-events-none" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-transparent border-x border-[#ded6c7] dark:border-[#1d221f]">
        {/* Unified Sub-Page Header with global language switcher */}
        <SubPageHeader
          title={t.farmPageTitle || "फार्म व पशु प्रबंधन"}
          subtitle={t.farmPageSub || "डेयरी विवरण व दैनिक चारा खपत"}
          backTo="/dashboard"
          actionBtn={
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-emerald-800 dark:text-[#86efac] text-xs font-bold shadow-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-transform active:scale-95"
            >
              {isEditing ? (t.cancel || "रद्द करें") : (t.edit || "बदलें ✏️")}
            </button>
          }
        />

        {/* Content */}
        <main className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* Farm Hero Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#143c20] to-[#0a2211] text-white shadow-md border border-emerald-600/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-2xl shadow-inner shrink-0">
                🏡
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-black truncate">{displayFarmName}</h2>
                <p className="text-xs text-emerald-200 mt-0.5">📍 {farmLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
              <div>
                <span className="text-[10px] text-emerald-300 font-semibold">{t.farmOperatorLabel || "फार्म संचालक:"}</span>
                <div className="font-extrabold text-white mt-0.5">{displayOwner}</div>
              </div>
              <div>
                <span className="text-[10px] text-emerald-300 font-semibold">{t.storageStructureLabel || "भंडारण ढांचा:"}</span>
                <div className="font-extrabold text-white mt-0.5">{displayStorageType}</div>
              </div>
            </div>
          </div>

          {/* Herd Stats Card */}
          <section className="bg-white/90 dark:bg-[#161c18]/90 backdrop-blur-md p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
            <span className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider block">
              {t.livestockMetricsHeader || "पशुधन विवरण"}
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-[#faf7f0]/80 dark:bg-[#0f1411]/80 border border-[#ded5c2] dark:border-[#242824]">
                <span className="text-lg font-black text-[#064d2c] dark:text-white">{farmData.totalCattle}</span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-bold">
                  {t.totalCattleCard || "कुल पशु 🐄"}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#faf7f0]/80 dark:bg-[#0f1411]/80 border border-[#ded5c2] dark:border-[#242824]">
                <span className="text-lg font-black text-[#064d2c] dark:text-white">{farmData.milkingCows}</span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-bold">
                  {t.milkingCowsCard || "दुधारू 🥛"}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#faf7f0]/80 dark:bg-[#0f1411]/80 border border-[#ded5c2] dark:border-[#242824]">
                <span className="text-lg font-black text-[#064d2c] dark:text-white">{farmData.dailyFodderRequirementKg}</span>
                <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-bold">
                  {t.dailyFodderCard || "दैनिक चारा 🌾"}
                </span>
              </div>
            </div>
          </section>

          {/* Feeding Advice Card */}
          <div className="bg-white/90 dark:bg-[#161c18]/90 backdrop-blur-md p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h3 className="text-xs font-black text-[#064d2c] dark:text-white">
                {t.cattleScheduleTitle || "दैनिक चारा सारणी व सुझाव"}
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.farmAdviceText || "प्रत्येक दुधारू गाय को 15-20 कि.ग्रा. अच्छी गुणवत्ता वाला साइलेज, 5 कि.ग्रा. सूखा भूसा और दाना मिश्रण नियमित रूप से दें। नमी और फफूंद की जाँच समय पर करें।"}
            </p>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSave} className="bg-white dark:bg-[#161c18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
              <span className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider block">
                {t.editFarmBtn || "फार्म विवरण संपादित करें"}
              </span>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.farmNameLabel || "फार्म का नाम"}
                </label>
                <input
                  type="text"
                  value={farmData.customFarmName || displayFarmName}
                  onChange={(e) => setFarmData({ ...farmData, customFarmName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.farmLocationLabel || "स्थान"}
                </label>
                <input
                  type="text"
                  value={farmData.customLocation || farmLocation}
                  onChange={(e) => setFarmData({ ...farmData, customLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.totalCattleLabel || "कुल पशु संख्या"}
                  </label>
                  <input
                    type="number"
                    value={farmData.totalCattle}
                    onChange={(e) => {
                      const count = Number(e.target.value) || 0;
                      setFarmData({
                        ...farmData,
                        totalCattle: count,
                        milkingCows: Math.round(count * 0.75),
                        dailyFodderRequirementKg: count * 20,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.milkingCattleLabel || "दुधारू संख्या"}
                  </label>
                  <input
                    type="number"
                    value={farmData.milkingCows}
                    onChange={(e) => setFarmData({ ...farmData, milkingCows: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-md cursor-pointer mt-2"
              >
                {t.saveFarmBtn || "अपडेट सुरक्षित करें"}
              </button>
            </form>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
