import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import BottomNavBar from "../components/layout/BottomNavBar";
import { CameraIcon, CheckIcon } from "../components/common/Icons";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, user, updateProfile } = useDashboard();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    gender: user?.gender || "male",
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: formData.name,
        email: formData.email,
        age: formData.age === "" ? null : Number(formData.age),
        gender: formData.gender,
        avatarFile: avatarFile || undefined,
      });
      setAvatarFile(null);
    } catch (apiError) {
      setError(apiError.message || "प्रोफ़ाइल सुरक्षित नहीं हो सकी। कृपया पुनः प्रयास करें।");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (formData.name || user?.phone || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        <SubPageHeader
          title={t.profilePageTitle || t.menuPersonalInfoTitle}
          subtitle={t.profilePageSub}
          backTo="/dashboard"
        />

        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Avatar & Photo Change Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm flex items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2D5A3D]"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#143c20] text-emerald-100 flex items-center justify-center text-xl font-black shadow-inner border border-emerald-600/30">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload Photo"
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#2D5A3D] text-white flex items-center justify-center text-xs shadow-md border-2 border-white dark:border-[#181e18] cursor-pointer hover:bg-[#1b4329]"
              >
                <CameraIcon className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-black text-[#064d2c] dark:text-white truncate">
                {formData.name || user?.phone}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.phone}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer mt-0.5 block"
              >
                {t.changePhotoText}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name */}
            <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                {t.fullNameLabel}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
              />
            </div>

            {/* Mobile (read-only) & Email */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.mobileNumberLabel}
                </label>
                <div className="flex items-center rounded-xl border border-[#ded5c2] dark:border-[#242824] bg-gray-100 dark:bg-[#0a0d0a] overflow-hidden">
                  <input
                    type="tel"
                    disabled
                    value={user?.phone || ""}
                    className="w-full px-3 py-2 text-xs font-bold bg-transparent text-gray-500 dark:text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.emailIdLabel}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@dairyfarm.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.ageLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.genderLabel}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                >
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                  <option value="other">{t.genderOther}</option>
                </select>
              </div>
            </div>

            {/* Cattle & Farm details live on their own pages */}
            <button
              type="button"
              onClick={() => navigate("/farm")}
              className="w-full flex items-center justify-between p-3.5 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-xs text-left cursor-pointer"
            >
              <span className="text-xs font-bold text-[#064d2c] dark:text-white">
                {t.farmPageTitle}
              </span>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                {t.addBreedDetailsLink}
              </span>
            </button>

            {error && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            )}

            {/* Save Button */}
            <div className="pt-2 pb-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                <span>{isSaving ? t.savingBtn : (t.saveProfileChangesBtn || t.save)}</span>
                <CheckIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </main>

        <BottomNavBar />
      </div>
    </div>
  );
}
