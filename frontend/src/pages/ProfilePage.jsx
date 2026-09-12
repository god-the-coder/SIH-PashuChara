import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";
import BottomNavBar from "../components/layout/BottomNavBar";
import { CameraIcon, MicIcon, CowIcon, CheckIcon } from "../components/common/Icons";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, user, displayName, updateProfile, showToast } = useDashboard();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "रमेश चौधरी",
    age: user?.age || "45",
    cattleCount: user?.cattleCount || 24,
    location: user?.location || "करनाल, हरियाणा",
    phone: user?.phone || "9876543210",
    email: user?.email || "ramesh.choudhary@dairyfarm.in",
    gender: user?.gender || "male",
    avatar: user?.avatar || "",
  });

  const [isListening, setIsListening] = useState(false);

  // Simulated Voice-Assisted Form Filling
  const handleVoiceFill = () => {
    setIsListening(true);
    showToast("आवाज़ सुन रहे हैं... कृपया विवरण बोलें");
    setTimeout(() => {
      setIsListening(false);
      setFormData({
        name: "रमेश चौधरी (Ramesh Choudhary)",
        age: "45",
        cattleCount: 24,
        location: "करनाल, हरियाणा (Karnal, Haryana)",
        phone: "9876543210",
        email: "ramesh.choudhary@dairyfarm.in",
        gender: "male",
        avatar: formData.avatar,
      });
      showToast("बोलकर विवरण सफलतापूर्वक दर्ज हो गया!");
    }, 1800);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target.result;
        setFormData((prev) => ({ ...prev, avatar: url }));
        updateProfile({ avatar: url });
        showToast("प्रोफ़ाइल फोटो अपडेट हो गई!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      isCustomName: true,
      age: formData.age,
      cattleCount: Number(formData.cattleCount) || 0,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      avatar: formData.avatar,
    });
    showToast("व्यक्तिगत जानकारी सुरक्षित की गई!");
  };

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "RC";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#e8e4dc] flex justify-center bg-[#FAF7F0] dark:bg-[#0a0c0b] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#101210]">
        {/* Unified SubPageHeader with language switcher */}
        <SubPageHeader
          title={t.profilePageTitle || t.menuPersonalInfoTitle || "व्यक्तिगत जानकारी"}
          subtitle={t.profilePageSub || "प्रोफ़ाइल, संपर्क व किसान पहचान"}
          backTo="/dashboard"
        />

        {/* Content */}
        <main className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Avatar & Photo Change Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#181e18] border border-[#ded5c2] dark:border-[#242824] shadow-sm flex items-center gap-4">
            <div className="relative">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
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
                {formData.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                +91 {formData.phone}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer mt-0.5 block"
              >
                {t.changePhotoText || "फ़ोटो बदलें (Change Photo)"}
              </button>
            </div>
          </div>

          {/* Voice Form Filling Banner */}
          <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-[#16291b] dark:to-[#222116] border border-[#d2e0d4] dark:border-[#334636] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <MicIcon className="w-6 h-6 text-emerald-800 dark:text-emerald-300 animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-black text-[#064d2c] dark:text-white block">
                  {t.voiceFillBannerTitle || "बोलकर प्रोफ़ाइल भरें"}
                </span>
                <span className="text-[10px] text-gray-600 dark:text-gray-300">
                  {t.voiceFillBannerSub || "नाम, आयु, पशु संख्या व स्थान बोलें"}
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
              {isListening ? (
                t.listeningText || "सुन रहे हैं..."
              ) : (
                <span className="flex items-center gap-1">
                  <MicIcon className="w-3 h-3" />
                  <span>{t.speakBtnText || "बोलें"}</span>
                </span>
              )}
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name */}
            <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                {t.fullNameLabel || "पूरा नाम (Full Name) *"}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
              />
            </div>

            {/* Mobile & Email */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.mobileNumberLabel || "मोबाइल नंबर (Mobile Number) *"}
                </label>
                <div className="flex items-center rounded-xl border border-[#ded5c2] dark:border-[#242824] bg-[#faf7f0] dark:bg-[#0f1411] overflow-hidden">
                  <span className="px-3 py-2 text-xs font-bold text-gray-500 border-r border-[#ded5c2] dark:border-[#242824]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-3 py-2 text-xs font-bold bg-transparent text-gray-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.emailIdLabel || "ईमेल पता (Email ID)"}
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
                  {t.ageLabel || "आयु (Age)"}
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                />
              </div>

              <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
                <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                  {t.genderLabel || "लिंग (Gender)"}
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
                >
                  <option value="male">{t.genderMale || "पुरुष (Male)"}</option>
                  <option value="female">{t.genderFemale || "महिला (Female)"}</option>
                  <option value="other">{t.genderOther || "अन्य (Other)"}</option>
                </select>
              </div>
            </div>

            {/* Number of Cattle */}
            <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-[#064d2c] dark:text-white flex items-center gap-1.5">
                  <span>{t.totalCattleFieldLabel || "पशुओं की कुल संख्या (Total Cattle)"}</span>
                  <CowIcon className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/cattle")}
                  className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {t.addBreedDetailsLink || "नस्ल व विवरण जोड़ें →"}
                </button>
              </div>
              <input
                type="number"
                value={formData.cattleCount}
                onChange={(e) => setFormData({ ...formData, cattleCount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
              />
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-[#181e18] p-3.5 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-xs">
              <label className="block text-xs font-black text-[#064d2c] dark:text-white mb-1">
                {t.locationFieldLabel || "स्थान / गाँव / जिला / राज्य (Location) *"}
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded5c2] dark:border-[#242824] text-xs font-bold bg-[#faf7f0] dark:bg-[#0f1411] text-gray-800 dark:text-white outline-none"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2 pb-4">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
              >
                <span>{t.saveProfileChangesBtn || t.save || "प्रोफ़ाइल सुरक्षित करें"}</span>
                <CheckIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar />
      </div>
    </div>
  );
}
