import { formatDateTime, formatRelativeTime } from "./date";
import { formatStatus } from "./status";

export function formatMetric(value, options = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return new Intl.NumberFormat("ar-EG", options).format(Number(value));
}

export function formatPercentage(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0%";
  }

  return `${Number(value).toFixed(1)}%`;
}

export function formatDoctorAccountStatus(value) {
  return formatStatus(value);
}

export function formatAlertSeverity(value = "") {
  const translations = {
    low: "منخفض",
    medium: "متوسط",
    high: "مرتفع",
    critical: "حرج"
  };

  return translations[value.toLowerCase()] || value;
}

export function buildDoctorLocation(doctor) {
  return [doctor.city, doctor.region].filter(Boolean).join(" / ") || "-";
}

export function formatLastActivity(value) {
  if (!value) {
    return "لا يوجد نشاط حديث";
  }

  return `${formatRelativeTime(value)} • ${formatDateTime(value)}`;
}
