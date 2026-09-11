import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t, login } = useDashboard();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.message || "लॉगिन विफल रहा। कृपया पुनः प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        <SubPageHeader
          title={t.drawerLoginLabel || "किसान लॉगिन"}
          subtitle="पशुचारा AI सुरक्षित प्रवेश"
          backTo="/dashboard"
        />

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

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  मोबाइल नंबर
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
                  className="w-full px-3.5 py-3 rounded-2xl border border-[#ded6c5] dark:border-[#343e34] bg-[#FAF7F0] dark:bg-[#131613] text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-emerald-600"
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

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              नया खाता बनाना है?{" "}
              <Link to="/register" className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline">
                रजिस्टर करें
              </Link>
            </p>
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
