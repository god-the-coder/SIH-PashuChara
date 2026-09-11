import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, SUPPORTED_LANGUAGES } from "../constants/translations";
import authService from "../services/auth/authService";
import { getApiError } from "../services/api/error";

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
 * Fields the backend doesn't track yet (age, cattleCount, location, ...)
 * are left neutral rather than fabricated — later phases (farm/cattle) fill
 * these in from their own real endpoints.
 */
function userFromSession(apiUser) {
  return {
    ...GUEST_USER,
    isLoggedIn: true,
    isCustomName: true,
    name: apiUser.full_name,
    role: "",
    phone: apiUser.phone_number,
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

  // 5. Auth Modal & UI state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState("login"); // "login" | "register"
  const [isVoiceOn, setIsVoiceOn] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [notifRead, setNotifRead] = useState(false);

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
      return next;
    });
  }, [t, showToast]);

  // Notifications
  const markAllRead = useCallback(() => {
    setNotifRead(true);
    showToast(t.toastAllRead || "सभी सूचनाएं पढ़ी गईं ✓");
  }, [t, showToast]);

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
    showToast("सफलतापूर्वक लॉग आउट हो गया 🔒");
  }, [showToast]);

  // Not backed by a real endpoint yet — these fields (age, location, cattle
  // count, ...) have no home on the backend until the farm/cattle phases land.
  const updateProfile = useCallback((fields) => {
    setUser((prev) => ({ ...prev, ...fields }));
    showToast("प्रोफ़ाइल जानकारी सुरक्षित की गई! ✓");
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

  // No account-deletion endpoint exists yet — this only clears local state.
  const deleteAccount = useCallback(() => {
    sessionStorage.clear();
    setUser(GUEST_USER);
    showToast("खाता व स्थानीय डेटा हटा दिया गया। 🗑️");
  }, [showToast]);

  // Dynamic translated display name and role if user has not set custom name
  const displayName = user?.isCustomName ? user.name : (t.navFarmerName || user?.name || "रमेश चौधरी");
  const displayRole = user?.isLoggedIn ? (t.navFarmRole || user?.role || "डेयरी किसान") : (t.drawerLoginLabel || "लॉगिन करें");
  const displayLocation = user?.location || t.drawerLocationTag || "आनंद, गुजरात";

  const value = {
    lang,
    t,
    isDark,
    fontSize,
    setFontSize,
    isVoiceOn,
    toast,
    notifRead,
    user,
    authChecked,
    displayName,
    displayRole,
    displayLocation,
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
