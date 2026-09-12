import { useEffect, useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import farmService from "../services/farm/farmService";
import BottomNavBar from "../components/layout/BottomNavBar";
import SubPageHeader from "../components/layout/SubPageHeader";
import { BarnIcon, LocationPinIcon, CowIcon, MilkIcon, WheatIcon, ClipboardIcon, EditIcon } from "../components/common/Icons";

export default function FarmPage() {
  const { t, showToast, user } = useDashboard();

  const [farm, setFarm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ farmName: "", location: "", totalCattle: "" });

  useEffect(() => {
    let cancelled = false;
    farmService
      .getMyFarm()
      .then((data) => {
        if (cancelled) return;
        setFarm(data);
        if (data) {
          setForm({
            farmName: data.farm_name,
            location: data.location,
            totalCattle: String(data.total_cattle),
          });
        } else {
          setIsEditing(true); // no farm yet — go straight to the create form
        }
      })
      .catch((apiError) => setError(apiError.message))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.farmName.trim() || !form.location.trim()) {
      setError(t.errFarmRequired);
      return;
    }

    setIsSaving(true);
    try {
      const totalCattle = Number(form.totalCattle) || 0;
      const saved = farm
        ? await farmService.updateFarm({ farmName: form.farmName, location: form.location, totalCattle })
        : await farmService.createFarm({ farmName: form.farmName, location: form.location, totalCattle });
      setFarm(saved);
      setIsEditing(false);
      showToast(t.farmUpdatedToast);
    } catch (apiError) {
      setError(apiError.message || t.errFarmSaveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const totalCattle = farm?.total_cattle ?? 0;
  const milkingCows = Math.round(totalCattle * 0.75);
  const dailyFodderRequirementKg = totalCattle * 20;

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
        <SubPageHeader
          title={t.farmPageTitle || "फार्म व पशु प्रबंधन"}
          subtitle={t.farmPageSub || "डेयरी विवरण व दैनिक चारा खपत"}
          backTo="/dashboard"
        />

        <main className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          {/* Action Row */}
          {farm && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider">
                {t.farmPageTitle || "फार्म विवरण"}
              </span>
              <button
                onClick={() => {
                  setIsEditing((prev) => !prev);
                  setError("");
                }}
                className="px-3 py-1.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-emerald-800 dark:text-[#86efac] text-xs font-bold shadow-xs cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-transform active:scale-95 flex items-center gap-1"
              >
                {isEditing ? (
                  t.cancel || "रद्द करें"
                ) : (
                  <>
                    <span>{t.edit || "बदलें"}</span>
                    <EditIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {isLoading && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-8">{t.loadingText}</p>
          )}

          {!isLoading && farm && !isEditing && (
            <>
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#143c20] to-[#0a2211] text-white shadow-md border border-emerald-600/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner shrink-0">
                    <BarnIcon className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-black truncate">{farm.farm_name}</h2>
                    <div className="flex items-center gap-1 text-xs text-emerald-200 mt-0.5">
                      <LocationPinIcon className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{farm.location}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/15 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-300 font-semibold">{t.farmOperatorLabel}</span>
                    <div className="font-extrabold text-white mt-0.5">{user?.name || "-"}</div>
                  </div>
                </div>
              </div>

              <section className="bg-white/90 dark:bg-[#161c18]/90 backdrop-blur-md p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
                <span className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider block">
                  {t.livestockMetricsHeader}
                </span>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-2xl bg-[#faf7f0]/80 dark:bg-[#0f1411]/80 border border-[#ded5c2] dark:border-[#242824]">
                    <span className="text-lg font-black text-[#064d2c] dark:text-white">{totalCattle}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-bold flex items-center justify-center gap-1">
                      <span>{t.totalCattleLabel || "कुल पशु"}</span>
                      <CowIcon className="w-3 h-3 text-[#064d2c] dark:text-emerald-400" />
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#faf7f0]/80 dark:bg-[#0f1411]/80 border border-[#ded5c2] dark:border-[#242824]">
                    <span className="text-lg font-black text-[#064d2c] dark:text-white">{milkingCows}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-bold flex items-center justify-center gap-1">
                      <span>{t.milkingCattleLabel || "दुधारू"}</span>
                      <MilkIcon className="w-3 h-3 text-[#064d2c] dark:text-emerald-400" />
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#faf7f0]/80 dark:bg-[#0f1411]/80 border border-[#ded5c2] dark:border-[#242824]">
                    <span className="text-lg font-black text-[#064d2c] dark:text-white">{dailyFodderRequirementKg}</span>
                    <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-bold flex items-center justify-center gap-1">
                      <span>{t.dailyFodderLabel || "दैनिक चारा"}</span>
                      <WheatIcon className="w-3 h-3 text-[#064d2c] dark:text-emerald-400" />
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {t.farmMetricsAutoNote}
                </p>
              </section>

              <div className="bg-white/90 dark:bg-[#161c18]/90 backdrop-blur-md p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <ClipboardIcon className="w-4 h-4 text-[#064d2c] dark:text-emerald-400" />
                  <h3 className="text-xs font-black text-[#064d2c] dark:text-white">
                    {t.cattleScheduleTitle}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t.farmAdviceText}
                </p>
              </div>
            </>
          )}

          {!isLoading && isEditing && (
            <form onSubmit={handleSave} className="bg-white dark:bg-[#161c18] p-4 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm space-y-3">
              <span className="text-xs font-black uppercase text-[#064d2c] dark:text-[#a8cfb4] tracking-wider block">
                {farm ? t.editFarmBtn : t.registerNewFarmTitle}
              </span>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.farmNameLabel || "फार्म का नाम"}
                </label>
                <input
                  type="text"
                  required
                  value={form.farmName}
                  onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.farmLocationLabel || "स्थान (Location)"}
                </label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {t.totalCattleLabel || "कुल पशु संख्या"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.totalCattle}
                  onChange={(e) => setForm({ ...form, totalCattle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-white dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              {error && <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-md cursor-pointer mt-2 disabled:opacity-60"
              >
                {isSaving ? t.savingBtn : t.saveFarmBtn}
              </button>
            </form>
          )}

          {!isLoading && !farm && !isEditing && error && (
            <p className="text-xs font-bold text-red-600 dark:text-red-400 text-center py-8">{error}</p>
          )}
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
