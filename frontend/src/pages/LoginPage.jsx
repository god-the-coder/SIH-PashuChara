import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, sendOtp, verifyOtp, loginWithGoogle } = useDashboard();

  // stage: 'phone' | 'otp'
  const [stage, setStage] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");

    if (phoneNumber.length < 10) {
      setError(t.errInvalidPhone || "कृपया 10 अंकों का मोबाइल नंबर दर्ज करें");
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+91${phoneNumber}`;
      const res = await sendOtp(fullPhone);
      if (res?.dev_otp) {
        setDevOtp(res.dev_otp);
        setOtp(res.dev_otp); // Pre-fill for dev convenience
      }
      setStage("otp");
    } catch (apiError) {
      setError(apiError.message || "OTP भेजने में विफल। कृपया पुनः प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("कृपया 6 अंकों का सही OTP दर्ज करें");
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+91${phoneNumber}`;
      await verifyOtp(fullPhone, otp.trim(), fullName.trim());
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.message || "OTP सत्यापन विफल रहा। पुनः प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      // Direct Google farmer authentication simulation
      const sampleEmail = `farmer_${Date.now().toString().slice(-4)}@gmail.com`;
      const sampleGid = `google_${Date.now()}`;
      await loginWithGoogle({
        email: sampleEmail,
        googleId: sampleGid,
        fullName: fullName.trim() || "Google किसान",
      });
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.message || "Google लॉगिन विफल रहा।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        <SubPageHeader
          title={t.drawerLoginLabel || "लॉगिन / साइन-अप"}
          subtitle={t.loginHeaderSubtitle || "पशुचारा AI सुरक्षित प्रवेश"}
          backTo="/"
        />

        <main className="p-5 my-auto">
          <div className="bg-white dark:bg-[#181e18] text-[#1c1c15] dark:text-[#f3ede2] p-6 rounded-3xl border border-[#ded5c2] dark:border-[#28382d] shadow-sm">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-300 dark:border-emerald-700/50 overflow-hidden flex items-center justify-center mx-auto mb-2.5 shadow-inner">
                <img src="/app-logo.png" alt="PashuChara" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-black text-[#14351d] dark:text-white">
                {stage === "phone" ? (t.authModalTitle || "Sign in to PashuChara") : (t.otpTitle || "OTP Verification")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stage === "phone"
                  ? (t.noPasswordNote || "Enter your mobile number, no password required 🌾")
                  : `${t.otpSentNote || "6-digit OTP has been sent to"} +91 ${phoneNumber}`}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {stage === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.optionalNameLabel || "Your Name (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder={t.namePlaceholder || "e.g. Ramesh Chaudhary"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-[#FAF7F0] dark:bg-[#131613] text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {t.phoneInputLabel || "Mobile Number (Primary)"}
                  </label>
                  <div className="flex items-center rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-[#FAF7F0] dark:bg-[#131613] overflow-hidden focus-within:border-emerald-600">
                    <span className="px-3.5 py-3 text-xs font-black text-gray-600 dark:text-gray-400 border-r border-[#ded6c5] dark:border-[#343e34] bg-gray-50 dark:bg-[#1a1f1a]">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder={t.phonePlaceholder || "Enter 10-digit number"}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-3.5 py-3 text-sm font-bold bg-transparent text-gray-800 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-60 mt-2"
                >
                  <span>{isLoading ? (t.sendingOtpBtn || "Sending OTP...") : (t.getOtpBtn || "Get OTP 📲")}</span>
                  <span className="text-xs">→</span>
                </button>

                <div className="relative my-4 text-center">
                  <hr className="border-[#ded5c2] dark:border-[#28382d]" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#181e18] px-2 text-[10px] text-gray-400 font-bold uppercase">
                    {t.orDividerText || "OR"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-white dark:bg-[#131613] hover:bg-gray-50 dark:hover:bg-[#1e241e] text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm disabled:opacity-60"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{t.googleBtnText || "Continue with Google"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t.otpCodeLabel || "6-Digit OTP Code"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setStage("phone")}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      {t.changePhoneBtn || "← Change Number"}
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-3 rounded-2xl border border-emerald-500/50 bg-[#FAF7F0] dark:bg-[#131613] text-center text-xl tracking-[0.4em] font-black text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  {devOtp && (
                    <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 text-center font-mono font-bold">
                      [Dev Mode OTP: {devOtp}]
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  <span>{isLoading ? (t.verifyingOtpBtn || "Verifying...") : (t.verifyAndLoginBtn || "Verify & Sign In 🌾")}</span>
                  <span className="text-xs">✓</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    {t.resendOtpBtn || "Resend OTP"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>

        <footer className="p-4 text-center text-[10px] text-gray-500">
          {t.dataSafetyFooter}
        </footer>
      </div>
    </div>
  );
}
