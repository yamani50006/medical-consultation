export const appQueryKeys = {
  doctors: (params?: Record<string, unknown>) => ["doctors", params] as const,
  doctorDetails: (id: string) => ["doctor", id] as const,
  appointments: (params?: Record<string, unknown>) => ["appointments", params] as const,
  appointmentsRoot: () => ["appointments"] as const,
  notifications: (params?: Record<string, unknown>) => ["notifications", params] as const,
  conversations: (params?: Record<string, unknown>) => ["conversations", params] as const,
  patientProfile: () => ["patient-profile"] as const,
  posts: (params?: Record<string, unknown>) => ["posts", params] as const
};
