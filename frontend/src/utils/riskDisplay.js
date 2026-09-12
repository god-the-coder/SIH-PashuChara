// Shared display helpers for rendering a backend Result (risk_category, findings)
// consistently across ResultsPage, MoreInfoPage and LabReportPage.

export function labelize(value = "") {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const RISK_BANNER_STYLES = {
  LOW: { gradient: "from-[#12361d] to-[#0c2413]", dot: "bg-emerald-400", tag: "text-emerald-300" },
  CAUTION: { gradient: "from-[#4d3a10] to-[#2e2308]", dot: "bg-amber-400", tag: "text-amber-300" },
  HIGH: { gradient: "from-[#4a1414] to-[#2b0c0c]", dot: "bg-red-400", tag: "text-red-300" },
  UNCERTAIN: { gradient: "from-[#1c2a3d] to-[#0f1826]", dot: "bg-blue-400", tag: "text-blue-300" },
};

export const RISK_BADGE_STYLES = {
  LOW: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  CAUTION: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 border-red-300 dark:border-red-700",
  UNCERTAIN: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-300 dark:border-blue-700",
};

export const SEVERITY_BADGE_STYLES = {
  none: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300",
  mild: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  moderate: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  severe: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export function groupRecommendationsByUrgency(recommendations = []) {
  const groups = { IMMEDIATE: [], CORRECTIVE: [], VERIFICATION: [] };
  for (const rec of recommendations) {
    (groups[rec.urgency] || groups.CORRECTIVE).push(rec);
  }
  return groups;
}
