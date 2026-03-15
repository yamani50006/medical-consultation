export function normalizeOptionalString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function sanitizePlainText(value, { collapseWhitespace = false } = {}) {
  const normalizedValue = normalizeOptionalString(value)
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n");

  if (!collapseWhitespace) {
    return normalizedValue;
  }

  return normalizedValue.replace(/\s+/g, " ").trim();
}

export function buildTextPreview(value, maxLength = 120) {
  const normalizedValue = sanitizePlainText(value, { collapseWhitespace: true });

  if (normalizedValue.length <= maxLength) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(0, maxLength - 1)}…`;
}
