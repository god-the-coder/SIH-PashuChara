import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import { WheatIcon, LockIcon } from "../components/common/Icons";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, login, showToast } = useDashboard();
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      showToast("कृपया वैध 10-अंकीय मोबाइल नंबर दर्ज करें");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      showToast(`+91 ${phoneNumber} पर 6-अंकीय OTP भेजा गया`);
    }, 700);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const entered = otp.join("");
    if (entered.length < 6) {
      showToast("कृपया पूरा 6-अंकीय OTP डालें");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login({
        id: "farmer_" + Date.now(),
        name: "रमेश चौधरी",
        phone: "+91 " + phoneNumber,
        location: "आनंद, गुजरात",
        farmType: "डेयरी फार्म (14 गायें)",
        avatar: null,
      });
      navigate("/dashboard");
    }, 800);
  };

  const handleGoogleLogin = () => {
    login({
      id: "google_farmer_102",
      name: "राजेश पटेल",
      phone: "+91 98250 12345",
      location: "मेहसाणा, गुजरात",
      farmType: "गाय व भैंस पालन (22 पशु)",
      avatar: null,
    });
    navigate("/dashboard");
  };

  const handleOtpChange = (index, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[index] = val.slice(-1);
    setOtp(next);
    if (val && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex justify-center bg-[#ECE8E1] dark:bg-black antialiased"
      style={{ fontFamily: "'Hind', 'Poppins', sans-serif" }}
    >
      <div className="relative min-h-screen w-full max-w-[430px] flex flex-col justify-between overflow-hidden shadow-2xl bg-[#FAF7F0] dark:bg-[#0f1110]">
        {/* Top bar with back */}
        <header className="p-4 flex items-center justify-between z-10">
          <button
            onClick={() => (step === "otp" ? setStep("phone") : navigate("/dashboard"))}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#1c221c] border border-[#ded5c2] dark:border-[#2b332b] flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-xs cursor-pointer active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            {step === "phone" ? (t.loginStep1 || "चरण 1 / 2") : (t.loginStep2 || "चरण 2 / 2")}
          </span>
          <div className="w-10" />
        </header>

        {/* Card Box */}
        <main className="p-5 my-auto">
          <div className="bg-white dark:bg-[#181e18] text-[#1c1c15] dark:text-[#e8e4dc] p-6 rounded-3xl border border-[#ded5c2] dark:border-[#242824] shadow-sm">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#161914] text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                <WheatIcon className="w-7 h-7 text-emerald-800 dark:text-emerald-300" />
              </div>
              <h2 className="text-xl font-black text-[#064d2c] dark:text-white">
                {t.authModalTitle || "पशुचारा में प्रवेश"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.authModalSub || "अपनी सभी चारा रिपोर्ट व पशुधन डेटा सुरक्षित रखने हेतु साइन-इन करें"}
              </p>
            </div>

            {/* STEP 1: Phone input primary + Google secondary */}
            {step === "phone" && (
              <div className="space-y-4">
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t.phoneInputLabel || "मोबाइल नंबर (Primary)"}
                    </label>
                    <div className="flex items-center rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-[#FAF7F0] dark:bg-[#131613] overflow-hidden focus-within:border-emerald-600">
                      <span className="px-3.5 py-3 text-xs font-black text-gray-600 dark:text-gray-400 border-r border-[#ded6c5] dark:border-[#343e34] bg-gray-50 dark:bg-[#1a1f1a]">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        placeholder={t.phonePlaceholder || "10 अंकों का नंबर डालें"}
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
                    <span>{isLoading ? (t.listeningText || "प्रतीक्षा करें...") : (t.getOtpBtn || "OTP प्राप्त करें")}</span>
                    <span className="text-xs">→</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-[#e2ddd4] dark:border-[#2c352c] w-full" />
                  <span className="bg-white dark:bg-[#181e18] px-3 text-[11px] font-bold text-gray-400 uppercase">
                    {t.orDividerText || "अथवा (OR)"}
                  </span>
                </div>

                {/* Secondary Option: Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full py-3 px-4 rounded-2xl bg-[#FAF7F0] dark:bg-[#202520] hover:bg-gray-100 dark:hover:bg-[#262c26] border border-[#ded6c5] dark:border-[#343e34] text-xs font-black text-gray-700 dark:text-gray-200 shadow-xs flex items-center justify-center gap-3 cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{t.googleBtnText || "Google खाते से साइन-इन करें"}</span>
                </button>
              </div>
            )}

            {/* STEP 2: OTP Entry */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-[#161914] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 flex items-center justify-center mx-auto mb-1">
                    <LockIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-[#1c3328] dark:text-white mt-1">
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
                      id={`login-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otp];
                        newOtp[idx] = e.target.value;
                        setOtp(newOtp);
                        if (e.target.value && idx < 5) {
                          document.getElementById(`login-otp-${idx + 1}`)?.focus();
                        }
                      }}
                      className="w-11 h-12 text-center text-lg font-black rounded-xl border border-[#ded6c5] dark:border-[#343e34] bg-[#FAF7F0] dark:bg-[#131613] text-gray-800 dark:text-white focus:border-emerald-600 outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-extrabold text-sm shadow-md flex items-center justify-center cursor-pointer"
                >
                  <span>{isLoading ? (t.listeningText || "सत्यापित हो रहा है...") : (t.verifyOtpBtn || "सत्यापित करें व आगे बढ़ें")}</span>
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
                  >
                    {t.changePhoneBtn || "← नंबर बदलें"}
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(t.toastVoiceOn ? "OTP भेजा गया: 123456" : "OTP sent")}
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {t.resendOtpBtn || "दोबारा भेजें"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              ← {t.stayDashboardBtn || "बिना लॉगिन अतिथि के रूप में जारी रखें"}
            </button>
          </div>
        </main>

        <footer className="p-4 text-center text-[10px] text-gray-500">
          {t.dataSafetyFooter || "पशुचारा AI • भारतीय कृषि व पशु पोषण डेटा सुरक्षा मानकों के अनुरूप"}
        </footer>
      </div>
    </div>
  );
}
