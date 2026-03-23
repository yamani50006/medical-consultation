const PLATFORM_TIMEZONE_OFFSET_MINUTES = Number(process.env.APPOINTMENT_TIMEZONE_OFFSET_MINUTES || 180);

export function normalizeAvailabilitySlots(slots = []) {
  const uniqueSlots = new Map();

  for (const slot of slots) {
    const weekday = Number(slot.weekday);
    const time = String(slot.time);
    uniqueSlots.set(`${weekday}-${time}`, { weekday, time });
  }

  return Array.from(uniqueSlots.values()).sort((left, right) => {
    if (left.weekday !== right.weekday) {
      return left.weekday - right.weekday;
    }

    return left.time.localeCompare(right.time);
  });
}

export function parseAvailabilityTime(time) {
  const [hour, minute] = String(time)
    .split(":")
    .map((value) => Number(value));

  return { hour, minute };
}

export function isAppointmentDateMatchingAvailability(appointmentDate, availabilitySlots = []) {
  const value = getPlatformDateParts(appointmentDate);
  const time = `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;

  return availabilitySlots.some((slot) => Number(slot.weekday) === value.weekday && String(slot.time) === time);
}

export function buildDoctorAppointmentSlots({ availabilitySlots = [], scheduledAppointments = [], days = 14, fromDate = new Date() }) {
  const normalizedSlots = normalizeAvailabilitySlots(availabilitySlots);
  const groupedByWeekday = normalizedSlots.reduce((acc, slot) => {
    const bucket = acc.get(slot.weekday) ?? [];
    bucket.push(slot);
    acc.set(slot.weekday, bucket);
    return acc;
  }, new Map());
  const bookedAppointments = new Set(
    scheduledAppointments.map((appointment) => new Date(appointment.appointmentDate).toISOString())
  );
  const slots = [];
  const startDate = getPlatformStartOfDay(fromDate);

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const currentDate = addPlatformDays(startDate, dayOffset);
    const currentDateParts = getPlatformDateParts(currentDate);
    const daySlots = groupedByWeekday.get(currentDateParts.weekday) ?? [];

    for (const slot of daySlots) {
      const { hour, minute } = parseAvailabilityTime(slot.time);
      const appointmentDate = createPlatformDate(
        currentDateParts.year,
        currentDateParts.month,
        currentDateParts.day,
        hour,
        minute
      );

      if (appointmentDate.getTime() <= fromDate.getTime()) {
        continue;
      }

      const appointmentDateIso = appointmentDate.toISOString();
      if (bookedAppointments.has(appointmentDateIso)) {
        continue;
      }

      slots.push({
        appointmentDate: appointmentDateIso,
        weekday: slot.weekday,
        time: slot.time
      });
    }
  }

  return slots;
}

function getPlatformDateParts(date) {
  const shiftedDate = new Date(new Date(date).getTime() + PLATFORM_TIMEZONE_OFFSET_MINUTES * 60 * 1000);

  return {
    year: shiftedDate.getUTCFullYear(),
    month: shiftedDate.getUTCMonth(),
    day: shiftedDate.getUTCDate(),
    weekday: shiftedDate.getUTCDay(),
    hour: shiftedDate.getUTCHours(),
    minute: shiftedDate.getUTCMinutes()
  };
}

function createPlatformDate(year, month, day, hour, minute) {
  return new Date(
    Date.UTC(year, month, day, hour, minute, 0, 0) - PLATFORM_TIMEZONE_OFFSET_MINUTES * 60 * 1000
  );
}

function getPlatformStartOfDay(date) {
  const value = getPlatformDateParts(date);
  return createPlatformDate(value.year, value.month, value.day, 0, 0);
}

function addPlatformDays(date, days) {
  const value = getPlatformDateParts(date);
  return createPlatformDate(value.year, value.month, value.day + days, 0, 0);
}
