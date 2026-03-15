export function formatDate(value, locale = "ar-EG") {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value, locale = "ar-EG") {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatTime(value, locale = "ar-EG") {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatRelativeTime(value, locale = "ar") {
  if (!value) {
    return "الآن";
  }

  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto"
  });

  if (absSeconds < 60) {
    return formatter.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return formatter.format(diffMonths, "month");
  }

  const diffYears = Math.round(diffMonths / 12);
  return formatter.format(diffYears, "year");
}

export function toDatetimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
}
