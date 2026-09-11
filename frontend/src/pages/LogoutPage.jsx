import { useNavigate } from "react-router-dom";
import { useDashboard } from "../context/DashboardContext";
import SubPageHeader from "../components/layout/SubPageHeader";

export default function LogoutPage() {
  const navigate = useNavigate();
  const { t, logout, user } = useDashboard();

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-[#1a1c18] dark:text-[#f3ede2] flex justify-center bg-[#FAF7F0] dark:bg-[#0c130e] antialiased">
      <div className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col justify-between shadow-2xl bg-[#FAF7F0] dark:bg-[#111713]">
        {/* SubPageHeader */}
        <SubPageHeader
          title={t.drawerLogoutLabel || "लॉग आउट"}
          subtitle="खाता सुरक्षा व सत्र समापन"
          backTo="/dashboard"
        />

        {/* Content */}
        <main className="p-6 flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-[#262016] border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 flex items-center justify-center text-4xl shadow-inner mb-4">
            🔒
          </div>

          <h2 className="text-xl font-black text-[#14351d] dark:text-white">
            क्या आप लॉग आउट करना चाहते हैं?
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-xs leading-relaxed">
            वर्तमान में आप <strong className="text-[#14351d] dark:text-white">{user?.name || "रमेश चौधरी"}</strong> के खाते में सक्रिय हैं। लॉग आउट करने पर भी आपका चारा रिकॉर्ड सुरक्षित रहेगा।
          </p>

          <div className="w-full mt-8 space-y-3">
            <button
              onClick={handleConfirmLogout}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>हाँ, लॉग आउट करें</span>
              <span>🔒</span>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3.5 rounded-2xl bg-[#2D5A3D] hover:bg-[#1E442B] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>नहीं, डैशबोर्ड पर वापस रहें</span>
              <span>🏠</span>
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
