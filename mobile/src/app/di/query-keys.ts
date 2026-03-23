export const appQueryKeys = {
  doctors: (params?: Record<string, unknown>) => ["doctors", params] as const,
  doctorFilters: () => ["doctor-filters"] as const,
  doctorDetails: (id: string) => ["doctor", id] as const,
  doctorAppointmentSlots: (id: string, params?: Record<string, unknown>) => ["doctor-appointment-slots", id, params] as const,
  myDoctorProfile: () => ["doctor-profile-me"] as const,
  appointments: (params?: Record<string, unknown>) => ["appointments", params] as const,
  appointmentsRoot: () => ["appointments"] as const,
  consultations: (params?: Record<string, unknown>) => ["consultations", params] as const,
  consultationsRoot: () => ["consultations"] as const,
  consultationDetails: (id: string) => ["consultation", id] as const,
  notifications: (params?: Record<string, unknown>) => ["notifications", params] as const,
  notificationsRoot: () => ["notifications"] as const,
  conversations: (params?: Record<string, unknown>) => ["conversations", params] as const,
  conversationsRoot: () => ["conversations"] as const,
  patientProfile: () => ["patient-profile"] as const,
  posts: (params?: Record<string, unknown>) => ["posts", params] as const
};
