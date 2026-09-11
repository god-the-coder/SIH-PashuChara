import { useDashboard } from "../../context/DashboardContext";

export default function ToastNotification() {
  const { toast } = useDashboard();
  return (
    <div
      id="toast"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#143c20] dark:bg-[#1b3523] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg border border-emerald-400/30 dark:border-emerald-500/30 transition-all duration-300 transform ${
        toast.visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      {toast.message}
    </div>
  );
}
