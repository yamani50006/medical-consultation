export function getStartOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function getEndOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export function isFutureDate(date) {
  return new Date(date).getTime() > Date.now();
}

export function normalizeDateRange(startDate, endDate) {
  return {
    gte: getStartOfDay(startDate),
    lte: getEndOfDay(endDate)
  };
}
