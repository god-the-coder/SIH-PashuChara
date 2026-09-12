import React from "react";

// Standard, ultra-clean Lucide/Heroicons SVG components
// Props: className (default 'w-5 h-5'), strokeWidth (default 1.8)

export const GlobeIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

export const BellIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const UserIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const UsersIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

// Cow — full body side profile, udder, tail up
export const CowIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 64 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <ellipse cx="30" cy="24" rx="20" ry="11" />
    {/* Head */}
    <ellipse cx="52" cy="18" rx="8" ry="6.5" />
    {/* Snout */}
    <ellipse cx="58" cy="20" rx="4" ry="3" opacity="0.7" />
    {/* Nostril dots */}
    <circle cx="57" cy="20" r="0.8" fill="white" />
    <circle cx="59.5" cy="20" r="0.8" fill="white" />
    {/* Eye */}
    <circle cx="53" cy="16" r="1.2" fill="white" />
    <circle cx="53" cy="16" r="0.6" fill="#333" />
    {/* Ear */}
    <ellipse cx="46" cy="13" rx="3" ry="1.8" transform="rotate(-20 46 13)" />
    {/* Horn */}
    <path d="M47 12 Q45 8 48 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Neck */}
    <path d="M44 14 Q44 22 50 22" fill="currentColor" />
    {/* Legs — 4 legs */}
    <rect x="14" y="33" width="4" height="7" rx="2" />
    <rect x="22" y="34" width="4" height="6" rx="2" />
    <rect x="34" y="34" width="4" height="6" rx="2" />
    <rect x="42" y="33" width="4" height="7" rx="2" />
    {/* Udder */}
    <ellipse cx="26" cy="34" rx="5" ry="3" opacity="0.75" />
    {/* Tail */}
    <path d="M10 22 Q4 16 6 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <ellipse cx="6" cy="9" rx="2" ry="3" />
  </svg>
);

// Milk bottle / Dairy icon
export const MilkIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8v3H8V2zm-1 3h10a2 2 0 012 2v2l-1 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2v-9l-1-2V7a2 2 0 012-2zm4 7a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

// Wheat / Fodder Grain sheaf icon
export const WheatIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M8 5a3 3 0 016 0M8 9a3 3 0 016 0M8 13a3 3 0 016 0M8 17a3 3 0 016 0M6 8c2 2 4 2 6 0M12 8c2 2 4 2 6 0M6 12c2 2 4 2 6 0M12 12c2 2 4 2 6 0" />
  </svg>
);

// Barn / Farm House icon
export const BarnIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-7a1 1 0 011-1h4a1 1 0 011 1v7m-6-4h6" />
  </svg>
);

// Location Pin
export const LocationPinIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// Voice Microphone
export const MicIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4m-4 0h8" />
  </svg>
);

// Microphone Muted
export const MicOffIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 1l22 22m-9-19a3 3 0 00-5.83 1.17l5.83 5.83V4zm-3 8a3 3 0 01-3-3V8.83l6 6A2.99 2.99 0 0112 15zm7-5v2a7 7 0 01-1.37 4.14M5 10v2a7 7 0 0010.84 5.85M12 19v4m-4 0h8" />
  </svg>
);

// Camera / Scanner
export const CameraIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <circle cx="12" cy="13" r="3.75" />
  </svg>
);

// AI Sparkles
export const SparklesIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

// Clipboard / Inspection List
export const ClipboardIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Calendar / Date
export const CalendarIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

// Share / Export
export const ShareIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
  </svg>
);

// Checkmark
export const CheckIcon = ({ className = "w-5 h-5", strokeWidth = 2.2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

// Close / X
export const CloseIcon = ({ className = "w-5 h-5", strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Security Lock
export const LockIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

// Home
export const HomeIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

// Phone / Helpline
export const PhoneIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

// Smartphone
export const SmartphoneIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <rect x="5" y="2" width="14" height="20" rx="3" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01" />
  </svg>
);

// Chat / Messages
export const ChatIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.85 5.966 5.966 0 001.378-3.033A8.093 8.093 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

// Settings
export const SettingsIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Theme Toggle Sun
export const SunIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
  </svg>
);

// Theme Toggle Moon
export const MoonIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

// Trash / Delete
export const TrashIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

// Broom / Clean storage
export const BroomIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-7.5 7.5m7.5-7.5a2.121 2.121 0 00-3-3l-7.5 7.5m10.5-4.5L12 12m-6 3a4.5 4.5 0 006 6l4.5-4.5L12 12l-4.5 4.5a4.5 4.5 0 00-1.5-1.5z" />
  </svg>
);

// Warning Alert Triangle
export const AlertTriangleIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

// Lightbulb / Recommendation Insight
export const LightbulbIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6 6 0 10-6-6c0 1.948.928 3.68 2.371 4.793M12 12.75A5.992 5.992 0 0118 6.75a6 6 0 00-3.629 5.543M8.25 18h7.5m-6 3h4.5" />
  </svg>
);

// Cloud Rain / Weather
export const CloudRainIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v2m4-2v2m4-2v2" />
  </svg>
);

// Corn / Silage cob
export const CornIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c-3.3 0-6 2.7-6 6v6a6 6 0 0012 0V8c0-3.3-2.7-6-6-6zm0 0v20m-3-16h6m-6 4h6m-6 4h6m-6 4h6" />
  </svg>
);

// Grain sack / Feed & Grain
export const GrainIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C9 3 6.5 5 6 8H18c-.5-3-3-5-6-5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l-1.5 10a2 2 0 002 2h11a2 2 0 002-2L18 8H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-5 3h4" />
  </svg>
);

// Buffalo — full body side profile, heavy neck hump, swept-back curved horns
export const BuffaloIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 64 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Body — heavier, lower */}
    <ellipse cx="28" cy="25" rx="21" ry="12" />
    {/* Neck hump — distinctive */}
    <ellipse cx="47" cy="17" rx="9" ry="8" />
    {/* Head — lower, heavier */}
    <ellipse cx="54" cy="22" rx="8" ry="6" />
    {/* Snout */}
    <ellipse cx="60" cy="24" rx="4" ry="3" opacity="0.7" />
    <circle cx="59" cy="24" r="0.8" fill="white" />
    <circle cx="61.5" cy="24" r="0.8" fill="white" />
    {/* Eye */}
    <circle cx="54" cy="19" r="1.2" fill="white" />
    <circle cx="54" cy="19" r="0.6" fill="#333" />
    {/* Curved swept-back horns */}
    <path d="M47 12 Q40 4 44 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M50 11 Q44 5 47 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Ear — drooping */}
    <ellipse cx="47" cy="16" rx="2.5" ry="4" transform="rotate(30 47 16)" opacity="0.85" />
    {/* Legs — thick */}
    <rect x="12" y="35" width="5" height="6" rx="2" />
    <rect x="21" y="35" width="5" height="6" rx="2" />
    <rect x="33" y="35" width="5" height="6" rx="2" />
    <rect x="41" y="35" width="5" height="6" rx="2" />
    {/* Tail — thin, drooping */}
    <path d="M7 24 Q2 30 4 36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Goat — full body side profile, slim, beard, upright horns, small tail
export const GoatIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 64 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {/* Body — slimmer */}
    <ellipse cx="29" cy="24" rx="17" ry="10" />
    {/* Neck */}
    <path d="M44 20 Q48 14 46 10 Q44 8 41 10 Q39 14 42 20Z" />
    {/* Head */}
    <ellipse cx="50" cy="9" rx="7" ry="5.5" />
    {/* Snout — elongated */}
    <ellipse cx="56" cy="11" rx="4" ry="2.5" opacity="0.75" />
    <circle cx="55.5" cy="11" r="0.7" fill="white" />
    <circle cx="57.5" cy="11" r="0.7" fill="white" />
    {/* Eye */}
    <circle cx="50" cy="7" r="1.1" fill="white" />
    <circle cx="50" cy="7" r="0.55" fill="#333" />
    {/* Upright horns */}
    <path d="M46 5 Q44 0 47 0" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M49 4 Q48 0 51 0" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {/* Ear */}
    <ellipse cx="44" cy="8" rx="2" ry="3.5" transform="rotate(-15 44 8)" opacity="0.85" />
    {/* Beard */}
    <path d="M54 14 Q55 18 53 20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Legs — slim */}
    <rect x="15" y="32" width="3" height="8" rx="1.5" />
    <rect x="22" y="33" width="3" height="7" rx="1.5" />
    <rect x="33" y="33" width="3" height="7" rx="1.5" />
    <rect x="40" y="32" width="3" height="8" rx="1.5" />
    {/* Small upright tail */}
    <path d="M12 22 Q9 17 11 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Package / Batch Box
export const PackageIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

// Edit / Pen
export const EditIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

// Send / Submit
export const SendIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

// Refresh / Retry
export const RefreshIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

// Microscope / Lab Assessment
export const MicroscopeIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v4m-3 0h6m2 5a6 6 0 11-12 0m12 0h-4m-2 4v6m-4 0h8" />
  </svg>
);

// Plus / Add
export const PlusIcon = ({ className = "w-5 h-5", strokeWidth = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Clock / Time Window
export const ClockIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);

// Document / Lab Report File
export const DocumentIcon = ({ className = "w-5 h-5", strokeWidth = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

