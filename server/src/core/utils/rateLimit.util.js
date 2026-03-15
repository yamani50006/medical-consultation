import AppError from "../errors/AppError.js";

const buckets = new Map();

function pruneExpiredEntries(now) {
  for (const [key, entry] of buckets.entries()) {
    if (entry.expiresAt <= now) {
      buckets.delete(key);
    }
  }
}

export function assertRateLimit(key, { limit, windowMs, message, code }) {
  const now = Date.now();
  pruneExpiredEntries(now);

  const currentEntry = buckets.get(key);
  if (!currentEntry || currentEntry.expiresAt <= now) {
    buckets.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });
    return;
  }

  if (currentEntry.count >= limit) {
    throw new AppError(message, 429, code, {
      retryAfterMs: currentEntry.expiresAt - now
    });
  }

  currentEntry.count += 1;
}
