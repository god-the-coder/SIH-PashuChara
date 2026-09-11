import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";

export default function AuthModal() {
  const navigate = useNavigate();
  const { authModalOpen, closeAuthModal, login } = useDashboard();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (phoneNumber.length < 10) {
      setError("कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें");
      return;
    }
    if (!password) {
      setError("कृपया पासवर्ड दर्ज करें");
      return;
    }

    setIsLoading(true);
    try {
      await login(`+91${phoneNumber}`, password);
      closeAuthModal();
      setPhoneNumber("");
      setPassword("");
    } catch (apiError) {
      setError(apiError.message || "लॉगिन विफल रहा। कृपया पुनः प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    closeAuthModal();
    navigate("/register");
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
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-300 transition-colors cursor-pointer"
        >
          ✕
        </button>

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

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                मोबाइल नंबर
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

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                पासवर्ड
              </label>
              <input
                type="password"
                required
                placeholder="अपना पासवर्ड डालें"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-white dark:bg-[#131613] text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-600"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <span>{isLoading ? "लॉगिन हो रहा है..." : "लॉगिन करें"}</span>
              <span className="text-xs">→</span>
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            नया खाता बनाना है?{" "}
            <button
              type="button"
              onClick={goToRegister}
              className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              रजिस्टर करें
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
