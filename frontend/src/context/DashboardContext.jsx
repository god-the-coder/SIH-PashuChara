import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, SUPPORTED_LANGUAGES } from "../constants/translations";

const DashboardContext = createContext(null);

const DEFAULT_USER = {
  isLoggedIn: true,
  isCustomName: false,
  name: "रमेश चौधरी",
  role: "डेयरी किसान",
  phone: "9876543210",
  email: "ramesh.choudhary@dairyfarm.in",
  gender: "male",
  age: "45",
  cattleCount: 24,
  location: "करनाल, हरियाणा",
  avatar: "",
  cattleDetails: [
    { id: "c-1", category: "cow", breed: "साहीवाल (Sahiwal)", count: 8, milkLiters: 120, lactationStage: "दुधारू" },
    { id: "c-2", category: "cow", breed: "गिर (Gir)", count: 4, milkLiters: 65, lactationStage: "दुधारू" },
    { id: "c-3", category: "buffalo", breed: "मुर्राह (Murrah)", count: 12, milkLiters: 160, lactationStage: "दुधारू" },
  ],
};

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

  // 4. User auth & profile state (persistent)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("pashuchaara_user");
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // 5. Auth Modal & UI state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState("login"); // "login" | "otp" | "survey"
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
        hi: next ? "डार्क मोड सक्रिय" : "लाइट मोड सक्रिय",
        en: next ? "Dark mode active" : "Light mode active",
        mr: next ? "डार्क मोड सक्रिय" : "लाइट मोड सक्रिय",
        gu: next ? "ડાર્ક મોડ સક્રિય" : "લાઇટ મોડ સક્રિય",
        kn: next ? "ಡಾರ್ಕ್ ಮೋಡ್ ಸಕ್ರಿಯ" : "ಲೈಟ್ ಮೋಡ್ ಸಕ್ರಿಯ",
        ta: next ? "டார்க் பயன்முறை இயக்கப்பட்டது" : "லைட் பயன்முறை இயக்கப்பட்டது",
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
    showToast(t.toastAllRead || "सभी सूचनाएं पढ़ी गईं");
  }, [t, showToast]);

  // Auth operations
  const login = useCallback((userData) => {
    const isCustom = userData.isCustomName !== undefined
      ? userData.isCustomName
      : Boolean(userData.name && userData.name !== DEFAULT_USER.name);

    const updated = {
      ...DEFAULT_USER,
      ...userData,
      isLoggedIn: true,
      isCustomName: isCustom,
    };
    setUser(updated);
    localStorage.setItem("pashuchaara_user", JSON.stringify(updated));
    showToast(`नमस्ते ${updated.name || "किसान जी"}! स्वागत है`);
  }, [showToast]);

  const logout = useCallback(() => {
    const loggedOutUser = {
      isLoggedIn: false,
      isCustomName: false,
      name: "अतिथि किसान",
      role: "लॉगिन करें",
      phone: "",
      age: "",
      cattleCount: 0,
      location: "",
    };
    setUser(loggedOutUser);
    localStorage.setItem("pashuchaara_user", JSON.stringify(loggedOutUser));
    showToast("सफलतापूर्वक लॉग आउट हो गया");
  }, [showToast]);

  const updateProfile = useCallback((fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields, isCustomName: true };
      localStorage.setItem("pashuchaara_user", JSON.stringify(updated));
      return updated;
    });
    showToast("प्रोफ़ाइल जानकारी सुरक्षित की गई!");
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
    showToast("ऐप कैश व अस्थायी फाइलें सफलतापूर्वक साफ हुईं!");
  }, [showToast]);

  const deleteAccount = useCallback(() => {
    localStorage.removeItem("pashuchaara_user");
    sessionStorage.clear();
    const guestUser = {
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
    setUser(guestUser);
    showToast("खाता व स्थानीय डेटा हटा दिया गया।");
  }, [showToast]);

  // Dynamic translated display name, role, and greeting name
  const isDefaultRamesh = !user?.isCustomName && (!user?.name || user.name === "रमेश चौधरी" || user.name === "Ramesh Choudhary");

  const displayName = !user?.isLoggedIn
    ? (t.drawerGuestAccount || "अतिथि किसान")
    : (isDefaultRamesh ? (t.navFarmerName || "रमेश चौधरी") : user.name);

  const displayRole = user?.isLoggedIn
    ? (t.navFarmRole || user?.role || "डेयरी किसान")
    : (t.drawerLoginLabel || "लॉगिन करें");

  const honorific = lang === "en" ? "ji" : lang === "gu" ? "ભાઈ" : lang === "ta" ? "அவர்களே" : "जी";

  const greetingName = !user?.isLoggedIn
    ? (t.drawerGuestAccount || "अतिथि किसान")
    : (isDefaultRamesh ? (t.farmerGreetingName || "रमेश जी") : `${user.name.split(" ")[0]} ${honorific}`);

  const isDefaultLocation = !user?.isCustomLocation && (!user?.location || user.location === "करनाल, हरियाणा" || user.location === "Karnal, Haryana");

  const displayLocation = isDefaultLocation
    ? (t.defaultFarmLocation || "करनाल, हरियाणा")
    : (user?.location || t.drawerLocationTag || "आनंद, गुजरात");

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
    displayName,
    displayRole,
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
