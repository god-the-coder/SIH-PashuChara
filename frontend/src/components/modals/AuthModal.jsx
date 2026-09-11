import { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";

export default function AuthModal() {
  const { authModalOpen, authModalStep, closeAuthModal, login, showToast, t } = useDashboard();

  const [step, setStep] = useState(authModalStep || "login");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"]);
  const [farmerDetails, setFarmerDetails] = useState({
    name: "रमेश चौधरी",
    age: "42",
    cattleCount: "16",
    location: "करनाल, हरियाणा",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      showToast("कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      showToast("OTP भेजा गया (123456)");
    }, 600);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("survey");
      showToast("Google साइन-इन सफल! कृपया प्रोफ़ाइल पूर्ण करें");
    }, 700);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("survey");
      showToast("मोबाइल नंबर सत्यापित हो गया!");
    }, 600);
  };

  const handleCompleteSurvey = (e) => {
    e.preventDefault();
    if (!farmerDetails.name) {
      showToast("कृपया अपना नाम दर्ज करें");
      return;
    }
    login({
      name: farmerDetails.name,
      role: "डेयरी किसान",
      phone: phoneNumber || "9876543210",
      age: farmerDetails.age,
      cattleCount: Number(farmerDetails.cattleCount) || 12,
      location: farmerDetails.location,
    });
    closeAuthModal();
    setStep("login");
  };

  return (
    <div
      id="authModalBackdrop"
      onClick={closeAuthModal}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
    >
      <div
        id="authModalCard"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[390px] rounded-3xl bg-[#FAF7F0] dark:bg-[#181a17] text-[#1a1c18] dark:text-[#f3ede2] border border-[#e5dfd3] dark:border-[#2b332b] shadow-2xl overflow-hidden p-6 transition-all"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* STEP 1: Phone (Primary) + Google (Secondary) */}
        {step === "login" && (
          <div className="space-y-4">
            <div className="text-center pt-2 pb-1">
              <div className="w-12 h-12 rounded-2xl bg-[#ede6d8] dark:bg-[#252c25] text-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                🌾
              </div>
              <h2 className="text-xl font-black text-[#1c3328] dark:text-white">
                पशुचारा AI में प्रवेश
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                अपनी चारा गुणवत्ता रिपोर्ट व पशुधन डेटा सुरक्षित रखने हेतु लॉगिन करें
              </p>
            </div>

            {/* Primary Option: Mobile Number */}
            <form onSubmit={handleSendOtp} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  मोबाइल नंबर (Primary)
                </label>
                <div className="flex items-center rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-white dark:bg-[#131613] overflow-hidden focus-within:border-emerald-600">
                  <span className="px-3.5 py-3 text-xs font-black text-gray-600 dark:text-gray-400 border-r border-[#ded6c5] dark:border-[#343e34] bg-gray-50 dark:bg-[#1a1f1a]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    placeholder="10 अंकों का नंबर डालें"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-3 text-sm font-bold bg-transparent text-gray-800 dark:text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <span>{isLoading ? "कृपया प्रतीक्षा करें..." : "OTP प्राप्त करें"}</span>
                <span className="text-xs">→</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#e2ddd4] dark:border-[#2c352c] w-full" />
              <span className="bg-[#FAF7F0] dark:bg-[#181a17] px-3 text-[11px] font-bold text-gray-400 uppercase">
                अथवा (OR)
              </span>
            </div>

            {/* Secondary Option: Google Login */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#202520] hover:bg-gray-50 dark:hover:bg-[#262c26] border border-[#ded6c5] dark:border-[#343e34] text-xs font-black text-gray-700 dark:text-gray-200 shadow-sm flex items-center justify-center gap-3 cursor-pointer transition-all"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google खाते से साइन-इन करें</span>
            </button>
          </div>
        )}

        {/* STEP 2: OTP Entry */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="text-center">
              <span className="text-2xl">🔐</span>
              <h3 className="text-lg font-black text-[#1c3328] dark:text-white mt-1">
                {t.otpTitle || "OTP सत्यापन"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                +91 {phoneNumber || "9876543210"} {t.otpSubtitle || "पर 6-अंकीय कोड भेजा गया"}
              </p>
            </div>

            <div className="flex justify-center gap-1.5 my-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`auth-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                    if (e.target.value && idx < 5) {
                      document.getElementById(`auth-otp-${idx + 1}`)?.focus();
                    }
                  }}
                  className="w-11 h-12 text-center text-lg font-black rounded-xl border border-[#ded6c5] dark:border-[#343e34] bg-white dark:bg-[#131613] text-gray-800 dark:text-white focus:border-emerald-600 outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-extrabold text-sm shadow-md flex items-center justify-center cursor-pointer"
            >
              <span>{t.verifyOtpBtn || "सत्यापित करें व आगे बढ़ें"}</span>
            </button>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
              >
                {t.changePhoneBtn || "← नंबर बदलें"}
              </button>
              <button
                type="button"
                onClick={() => showToast("OTP पुनः भेजा गया: 123456")}
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t.resendOtpBtn || "दोबारा भेजें"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Farmer Onboarding Survey (Name, Age, Cattle count, etc.) */}
        {step === "survey" && (
          <form onSubmit={handleCompleteSurvey} className="space-y-3 pt-1">
            <div className="text-center pb-1">
              <span className="text-2xl">👨‍🌾</span>
              <h3 className="text-lg font-black text-[#1c3328] dark:text-white mt-1">
                {t.surveyTitle || "किसान प्रोफ़ाइल विवरण"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t.surveySub || "सटीक चारा अनुपात व सलाह के लिए अपनी जानकारी भरें"}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                1. पूरा नाम (Farmer Name) *
              </label>
              <input
                type="text"
                required
                placeholder="जैसे: रमेश चौधरी"
                value={farmerDetails.name}
                onChange={(e) => setFarmerDetails({ ...farmerDetails, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#343e34] text-xs font-bold bg-white dark:bg-[#131613] text-gray-800 dark:text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  2. आयु (Age)
                </label>
                <input
                  type="number"
                  placeholder="42"
                  value={farmerDetails.age}
                  onChange={(e) => setFarmerDetails({ ...farmerDetails, age: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#343e34] text-xs font-bold bg-white dark:bg-[#131613] text-gray-800 dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  3. पशुओं की संख्या 🐄
                </label>
                <input
                  type="number"
                  placeholder="16"
                  value={farmerDetails.cattleCount}
                  onChange={(e) => setFarmerDetails({ ...farmerDetails, cattleCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#343e34] text-xs font-bold bg-white dark:bg-[#131613] text-gray-800 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                4. गाँव / जिला / राज्य (Location)
              </label>
              <input
                type="text"
                placeholder="जैसे: करनाल, हरियाणा"
                value={farmerDetails.location}
                onChange={(e) => setFarmerDetails({ ...farmerDetails, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ded6c5] dark:border-[#343e34] text-xs font-bold bg-white dark:bg-[#131613] text-gray-800 dark:text-white outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <span>प्रोफ़ाइल सुरक्षित करें व शुरू करें</span>
                <span className="text-sm">✓</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
