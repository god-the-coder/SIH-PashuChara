// Maps backend Notification.notification_type/severity onto the presentation
// classes/icons the UI mockups already used for the (previously hardcoded) alerts.
const TYPE_ICONS = {
  RISK_ALERT: "⚠️",
  RECOMMENDATION: "❗",
  BATCH_REMINDER: "🌽",
  WEATHER_ALERT: "🌧️",
  SYSTEM: "💡",
};

const SEVERITY_STYLES = {
  CRITICAL: {
    colorClasses: "bg-red-500/10 dark:bg-[#2d1919] border-red-500/30",
    iconClasses: "bg-red-500/20 text-red-800 dark:text-[#fca5a5]",
    titleClasses: "text-red-950 dark:text-[#fecaca]",
  },
  WARNING: {
    colorClasses: "bg-amber-500/10 dark:bg-[#2d2319] border-amber-500/30",
    iconClasses: "bg-amber-500/20 text-amber-800 dark:text-[#fcd34d]",
    titleClasses: "text-amber-950 dark:text-[#fef08a]",
  },
  INFO: {
    colorClasses: "bg-blue-500/10 dark:bg-[#182736] border-blue-500/30",
    iconClasses: "bg-blue-500/20 text-blue-800 dark:text-[#93c5fd]",
    titleClasses: "text-blue-950 dark:text-[#bfdbfe]",
  },
};

export function getNotificationDisplay(notification) {
  const icon = TYPE_ICONS[notification.notification_type] || "🔔";
  const style = SEVERITY_STYLES[notification.severity] || SEVERITY_STYLES.INFO;
  return { icon, ...style };
}

export function formatRelativeTime(isoString) {
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "अभी";
  if (minutes < 60) return `${minutes} मिनट पहले`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} घंटे पहले`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "कल";
  return `${days} दिन पहले`;
}
