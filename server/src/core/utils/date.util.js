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

export function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

export function getStartOfWeek(date = new Date()) {
  const value = getStartOfDay(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value;
}

export function getEndOfWeek(date = new Date()) {
  return getEndOfDay(addDays(getStartOfWeek(date), 6));
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
