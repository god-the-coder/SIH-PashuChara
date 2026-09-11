import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, login, showToast } = useDashboard();

  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"]);
  const [isLoading, setIsLoading] = useState(false);

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
      login({
        name: "रमेश चौधरी",
        phone: "9876543210",
        email: "ramesh.choudhary@dairyfarm.in",
        role: "डेयरी किसान",
      });
      showToast("Google साइन-इन सफल! स्वागत है 🌾");
      navigate("/dashboard");
    }, 700);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login({
        phone: phoneNumber || "9876543210",
        name: "रमेश चौधरी",
        role: "डेयरी किसान",
      });
      showToast("सफलतापूर्वक लॉगिन हो गया! 🌾");
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        {/* Header with language switcher */}
        <SubPageHeader
          title={t.drawerLoginLabel || "किसान लॉगिन"}
          subtitle="पशुचारा AI सुरक्षित प्रवेश"
          backTo="/dashboard"
        />

        {/* Card Box */}
        <main className="p-5 my-auto">
          <div className="bg-white dark:bg-[#181e18] text-[#1c1c15] dark:text-[#f3ede2] p-6 rounded-3xl border border-[#ded5c2] dark:border-[#28382d] shadow-sm">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#1a3324] text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-2xl mx-auto mb-2.5 shadow-inner">
                🌾
              </div>
              <h2 className="text-xl font-black text-[#14351d] dark:text-white">
                पशुचारा AI में प्रवेश
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                अपनी सभी चारा रिपोर्ट व पशुधन डेटा सुरक्षित रखने हेतु साइन-इन करें
              </p>
            </div>

            {/* STEP 1: Phone input primary + Google secondary */}
            {step === "phone" && (
              <div className="space-y-4">
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      मोबाइल नंबर (Primary)
                    </label>
                    <div className="flex items-center rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-[#FAF7F0] dark:bg-[#131613] overflow-hidden focus-within:border-emerald-600">
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
                    <span>{isLoading ? "OTP भेजा जा रहा है..." : "OTP प्राप्त करें (Send OTP)"}</span>
                    <span className="text-xs">→</span>
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-[#e2ddd4] dark:border-[#2c352c] w-full" />
                  <span className="bg-white dark:bg-[#181e18] px-3 text-[11px] font-bold text-gray-400 uppercase">
                    अथवा (OR)
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
                  <span>Google खाते से साइन-इन करें</span>
                </button>
              </div>
            )}

            {/* STEP 2: OTP Entry */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div className="text-center">
                  <span className="text-2xl">🔐</span>
                  <h3 className="text-base font-black text-[#1c3328] dark:text-white mt-1">
                    OTP सत्यापन
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    +91 {phoneNumber || "9876543210"} पर 6-अंकीय कोड भेजा गया
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
                  <span>{isLoading ? "सत्यापित हो रहा है..." : "सत्यापित करें व लॉगिन करें"}</span>
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-gray-500 dark:text-gray-400 hover:underline cursor-pointer"
                  >
                    ← नंबर बदलें
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast("OTP पुनः भेजा गया: 123456")}
                    className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    दोबारा भेजें
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
              ← बिना लॉगिन अतिथि के रूप में जारी रखें
            </button>
          </div>
        </main>

        <footer className="p-4 text-center text-[10px] text-gray-500">
          पशुचारा AI • भारतीय कृषि व पशु पोषण डेटा सुरक्षा मानकों के अनुरूप
        </footer>
      </div>
    </div>
  );
}
