import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "../constants/translations";
import authService from "../services/auth/authService";
import notificationService from "../services/notifications/notificationService";
import farmService from "../services/farm/farmService";
import { getApiError } from "../services/api/error";
import { detectCurrentLocationLabel } from "../utils/geolocation";
import speechService from "../services/voice/speechService";

const DashboardContext = createContext(null);

// Shown only while the session-check on app load hasn't resolved yet.
const CHECKING_USER = { isLoggedIn: false, isCustomName: false, name: "", role: "", phone: "" };

const GUEST_USER = {
  isLoggedIn: false,
  isCustomName: false,
  name: "अतिथि किसान",
  role: "लॉगिन करें",
  phone: "",
  email: "",
  gender: "male",
  age: "",
  cattleCount: 0,
  location: "",
  avatar: "",
  cattleDetails: [],
};

/**
 * Maps the backend's UserSerializer shape onto the fields the UI expects.
 * Fields the backend doesn't track at the account level (cattleCount,
 * location, ...) are left neutral rather than fabricated — the farm/cattle
 * phases fill these in from their own real endpoints.
 */
function userFromSession(apiUser) {
  return {
    ...GUEST_USER,
    isLoggedIn: true,
    isCustomName: true,
    name: apiUser.full_name,
    role: "",
    phone: apiUser.phone_number,
    email: apiUser.email || "",
    age: apiUser.age ?? "",
    gender: apiUser.gender || "",
    avatar: apiUser.avatar || "",
  };
}

export function DashboardProvider({ children }) {
  // 1. Language state (persistent)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("pashuchaara_lang") || "hi";
  });

  // 2. Dark mode state (persistent)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("pashuchaara_dark");
    return saved !== null ? saved === "true" : false;
  });

  // 3. Font size state (persistent)
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("pashuchaara_fontsize") || "normal";
  });

  // 4. User auth state — backed by the real session, re-checked on every load.
  // Not persisted to localStorage: the Django session cookie is the source of truth.
  const [user, setUser] = useState(CHECKING_USER);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((apiUser) => {
        if (!cancelled) setUser(userFromSession(apiUser));
      })
      .catch(() => {
        if (!cancelled) setUser(GUEST_USER);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 4b. Real farm record (for the real, saved location) + a live GPS fallback
  // used only until the farmer has a farm location saved on the backend.
  const [farm, setFarm] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState("");

  useEffect(() => {
    if (!authChecked || !user?.isLoggedIn) return;
    let cancelled = false;
    farmService
      .getMyFarm()
      .then((data) => {
        if (!cancelled) setFarm(data);
      })
      .catch(() => {
        // Best-effort — the drawer just falls back to the GPS/placeholder label.
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked, user?.isLoggedIn]);

  useEffect(() => {
    if (!authChecked || !user?.isLoggedIn || farm?.location) return;
    let cancelled = false;
    detectCurrentLocationLabel()
      .then((label) => {
        if (!cancelled && label) setDetectedLocation(label);
      })
      .catch(() => {
        // Permission denied / unsupported / API failure — keep the static placeholder.
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked, user?.isLoggedIn, farm?.location]);

  // 5. Auth Modal & UI state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState("login"); // "login" | "register"
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Notifications — real, session-backed list + unread count (see apps.notifications
  // on the backend). Not persisted locally: refetched from the server whenever a
  // logged-in session is confirmed and after any read/mark-all-read action.
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRead = unreadCount === 0;

  const t = translations[lang] ?? translations["hi"];

  // Sync dark mode class on <html>
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
    localStorage.setItem("pashuchaara_dark", String(isDark));
  }, [isDark]);

  // Sync font size class on <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("text-scale-small", "text-scale-normal", "text-scale-large");
    html.classList.add(`text-scale-${fontSize}`);
    localStorage.setItem("pashuchaara_fontsize", fontSize);
  }, [fontSize]);

  // Sync language attribute on <html>
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("pashuchaara_lang", lang);
  }, [lang]);

  // Toast notification
  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    const timer = setTimeout(() => setToast({ visible: false, message: "" }), 2400);
    return () => clearTimeout(timer);
  }, []);

  // Language switcher
  const changeLang = useCallback((code) => {
    setLang(code);
    showToast(translations[code]?.toastLangChanged ?? `भाषा बदली गई: ${code}`);
  }, [showToast]);

  // Dark mode toggle
  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      const msgs = {
        hi: next ? "डार्क मोड सक्रिय 🌙" : "लाइट मोड सक्रिय ☀️",
        en: next ? "Dark mode active 🌙" : "Light mode active ☀️",
        mr: next ? "डार्क मोड सक्रिय 🌙" : "लाइट मोड सक्रिय ☀️",
        gu: next ? "ડાર્ક મોડ સક્રિય 🌙" : "લાઇટ મોડ સક્રિય ☀️",
        kn: next ? "ಡಾರ್ಕ್ ಮೋಡ್ ಸಕ್ರಿಯ 🌙" : "ಲೈಟ್ ಮೋಡ್ ಸಕ್ರಿಯ ☀️",
        ta: next ? "டார்க் பயன்முறை இயக்கப்பட்டது 🌙" : "லைட் பயன்முறை இயக்கப்பட்டது ☀️",
      };
      showToast(msgs[lang] ?? msgs["hi"]);
      return next;
    });
  }, [lang, showToast]);

  // Voice toggle
  const toggleVoice = useCallback(() => {
    setIsVoiceOn((prev) => {
      const next = !prev;
      showToast(next ? t.toastVoiceOn : t.toastVoiceOff);
      if (next) {
        const feedback =
          lang === "en"
            ? "Voice assistance turned on"
            : lang === "mr"
            ? "आवाज सहाय्य चालू केले"
            : lang === "ta"
            ? "குரல் உதவி இயக்கப்பட்டது"
            : "आवाज़ सहायता चालू की गई";
        speechService.speak(feedback, { lang });
      } else {
        speechService.stop();
      }
      return next;
    });
  }, [t, showToast, lang]);

  // Notifications
  const refreshNotifications = useCallback(async () => {
    try {
      const [list, unread] = await Promise.all([
        notificationService.list(),
        notificationService.unreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(unread.count ?? 0);
    } catch {
      // Best-effort — the bell just shows stale/empty state until the next refresh.
    }
  }, []);

  useEffect(() => {
    if (!authChecked || !user?.isLoggedIn) return;
    let cancelled = false;
    Promise.all([notificationService.list(), notificationService.unreadCount()])
      .then(([list, unread]) => {
        if (cancelled) return;
        setNotifications(list);
        setUnreadCount(unread.count ?? 0);
      })
      .catch(() => {
        // Best-effort — the bell just shows stale/empty state until the next refresh.
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked, user?.isLoggedIn]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast(t.toastAllRead || "सभी सूचनाएं पढ़ी गईं ✓");
    } catch (error) {
      throw getApiError(error);
    }
  }, [t, showToast]);

  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      throw getApiError(error);
    }
  }, []);

  // Auth operations — session-backed; errors are normalized (getApiError) and
  // re-thrown so the calling form can show a field-level message.
  const login = useCallback(async (phoneNumber, password) => {
    try {
      const apiUser = await authService.login({ phoneNumber, password });
      const updated = userFromSession(apiUser);
      setUser(updated);
      showToast(`नमस्ते ${updated.name || "किसान जी"}! स्वागत है 🌾`);
      return updated;
    } catch (error) {
      throw getApiError(error);
    }
  }, [showToast]);

  const register = useCallback(async (phoneNumber, fullName, password) => {
    try {
      await authService.register({ phoneNumber, fullName, password });
      // Registration doesn't establish a session — log in immediately after.
      const apiUser = await authService.login({ phoneNumber, password });
      const updated = userFromSession(apiUser);
      setUser(updated);
      showToast(`स्वागत है ${updated.name || "किसान जी"}! खाता बन गया 🌾`);
      return updated;
    } catch (error) {
      throw getApiError(error);
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best-effort: still clear local state even if the request fails
      // (e.g. session already expired server-side).
    }
    setUser(GUEST_USER);
    setNotifications([]);
    setUnreadCount(0);
    setFarm(null);
    setDetectedLocation("");
    showToast("सफलतापूर्वक लॉग आउट हो गया 🔒");
  }, [showToast]);

  // Personal-profile fields (name, email, age, gender, avatar) are real,
  // session-backed data. Farm-level fields (location, cattle count) still
  // live on the farm/cattle endpoints, not here.
  const updateProfile = useCallback(async ({ fullName, email, age, gender, avatarFile }) => {
    try {
      const apiUser = await authService.updateProfile({ fullName, email, age, gender, avatarFile });
      const updated = userFromSession(apiUser);
      setUser(updated);
      showToast("प्रोफ़ाइल जानकारी सुरक्षित की गई! ✓");
      return updated;
    } catch (error) {
      throw getApiError(error);
    }
  }, [showToast]);

  const openAuthModal = useCallback((step = "login") => {
    setAuthModalStep(step);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const clearCache = useCallback(() => {
    sessionStorage.clear();
    showToast("ऐप कैश व अस्थायी फाइलें सफलतापूर्वक साफ हुईं! 🧹");
  }, [showToast]);

  const deleteAccount = useCallback(async () => {
    try {
      await authService.deleteAccount();
    } catch (error) {
      throw getApiError(error);
    }
    sessionStorage.clear();
    setUser(GUEST_USER);
    setNotifications([]);
    setUnreadCount(0);
    setFarm(null);
    setDetectedLocation("");
    showToast("खाता व समस्त डेटा स्थायी रूप से हटा दिया गया। 🗑️");
  }, [showToast]);

  // Dynamic translated display name, role, and greeting name
  const isDefaultRamesh = !user?.isCustomName && (!user?.name || user.name === "रमेश चौधरी" || user.name === "Ramesh Choudhary");

  const displayName = !user?.isLoggedIn
    ? (t.drawerGuestAccount || "अतिथि किसान")
    : (isDefaultRamesh ? (t.navFarmerName || "रमेश चौधरी") : user.name);

  const honorific = lang === "en" ? "ji" : lang === "gu" ? "ભાઈ" : lang === "ta" ? "அவர்களே" : "जी";

  const greetingName = !user?.isLoggedIn
    ? (t.drawerGuestAccount || "अतिथि किसान")
    : (isDefaultRamesh ? (t.farmerGreetingName || "रमेश जी") : `${user.name.split(" ")[0]} ${honorific}`);

  const displayLocation = farm?.location || detectedLocation || (t.defaultFarmLocation || "करनाल, हरियाणा");

  const value = {
    lang,
    t,
    isDark,
    fontSize,
    setFontSize,
    isVoiceOn,
    toast,
    notifRead,
    notifications,
    unreadCount,
    refreshNotifications,
    markNotificationRead,
    user,
    authChecked,
    farm,
    setFarm,
    displayName,
    displayLocation,
    greetingName,
    authModalOpen,
    authModalStep,
    changeLang,
    toggleVoice,
    toggleDark,
    showToast,
    markAllRead,
    login,
    register,
    logout,
    updateProfile,
    clearCache,
    deleteAccount,
    openAuthModal,
    closeAuthModal,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
