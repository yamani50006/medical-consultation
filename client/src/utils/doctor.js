export function formatDoctorLocation(doctor) {
  const parts = [doctor?.city, doctor?.region].filter(Boolean);
  return parts.length ? parts.join(" - ") : "الموقع غير محدد";
}

export function formatDoctorConsultationModes(doctor) {
  const modes = [];

  if (doctor?.supportsOnline) {
    modes.push("أونلاين");
  }

  if (doctor?.supportsInPerson) {
    modes.push("حضوري");
  }

  return modes.length ? modes : ["غير محدد"];
}

export function formatConsultationFee(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "السعر غير محدد";
  }

  return `${value} ريال`;
}
