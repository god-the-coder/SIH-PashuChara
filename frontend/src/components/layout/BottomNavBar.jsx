import { useNavigate, useLocation } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";

// SVG icon helpers
const HomeIcon = ({ active }) => (
  <svg className={`w-5 h-5`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const BatchIcon = ({ active }) => (
  <svg className={`w-5 h-5`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const ScanIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const LogIcon = ({ active }) => (
  <svg className={`w-5 h-5`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const FarmIcon = ({ active }) => (
  <svg className={`w-5 h-5`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
  </svg>
);

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, notifRead } = useDashboard();

  const leftItems = [
    { id: "nav-home", path: "/dashboard", label: t.navHome || "Home", Icon: HomeIcon },
    { id: "nav-batches", path: "/batches", label: t.navBatches || "Batches", Icon: BatchIcon },
  ];

  const rightItems = [
    { id: "nav-history", path: "/history", label: t.navHistory || "History", Icon: LogIcon },
    { id: "nav-farm", path: "/farm", label: t.navFarm || "Farm", Icon: FarmIcon },
  ];

  const isActive = (path) => location.pathname === path;

  const NavBtn = ({ item }) => {
    const active = isActive(item.path);
    return (
      <button
        id={item.id}
        onClick={() => navigate(item.path)}
        className={`relative flex flex-col items-center justify-center flex-1 min-h-[52px] py-1.5 rounded-xl transition-all cursor-pointer ${
          active ? "text-[#059652]" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        <item.Icon active={active} />
        <span className={`text-[10px] mt-0.5 font-semibold tracking-tight leading-none ${active ? "text-[#059652]" : ""}`}>
          {item.label}
        </span>
        {active && <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-[#059652]" />}
      </button>
    );
  };

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-white/97 dark:bg-[#0f1110]/97 backdrop-blur-lg border-t border-[#e8e2d8] dark:border-[#242424] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center px-2 py-1.5">
        {/* Left items */}
        {leftItems.map(item => <NavBtn key={item.id} item={item} />)}

        {/* Center Scan FAB */}
        <div className="flex flex-col items-center justify-center flex-1 py-1">
          <button
            id="nav-scan"
            onClick={() => navigate("/qr-report")}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-transform active:scale-95 hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #059652 0%, #10b96a 100%)" }}
          >
            <ScanIcon />
          </button>
          <span className="text-[10px] mt-1 font-semibold text-[#059652] leading-none">
            QR Report
          </span>
        </div>

        {/* Right items */}
        {rightItems.map(item => (
          <button
            key={item.id}
            id={item.id}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[52px] py-1.5 rounded-xl transition-all cursor-pointer ${
              isActive(item.path) ? "text-[#059652]" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            <div className="relative">
              <item.Icon active={isActive(item.path)} />
              {item.id === "nav-history" && !notifRead && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0f1110]" />
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-semibold tracking-tight leading-none ${isActive(item.path) ? "text-[#059652]" : ""}`}>
              {item.label}
            </span>
            {isActive(item.path) && <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-[#059652]" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
