import { useAuthStore } from "@/store/auth/auth.store";
import { useAppointmentsQuery } from "@/features/appointments";
import { useConsultations } from "@/features/consultations";
import { useNotificationsQuery } from "@/features/notifications";
import { usePatientProfileQuery } from "@/features/profile/hooks/usePatientProfileQuery";

const ACTIVE_CONSULTATION_STATUSES = new Set(["pending", "accepted", "awaiting_payment", "active"]);

export function useProfileOverview() {
  const currentUser = useAuthStore((state) => state.user);
  const profileQuery = usePatientProfileQuery();
  const appointmentsQuery = useAppointmentsQuery({ limit: 50 });
  const consultationsQuery = useConsultations({ limit: 50 });
  const notificationsQuery = useNotificationsQuery({ limit: 50 });

  const profile = profileQuery.data;
  const appointments = appointmentsQuery.data ?? [];
  const consultations = consultationsQuery.consultations ?? [];
  const notifications = notificationsQuery.data ?? [];
  const now = Date.now();

  const upcomingAppointments = appointments
    .filter((appointment) => appointment.status === "scheduled" && new Date(appointment.appointmentDate).getTime() >= now)
    .sort((left, right) => new Date(left.appointmentDate).getTime() - new Date(right.appointmentDate).getTime());

  const activeConsultationsCount = consultations.filter((consultation) =>
    ACTIVE_CONSULTATION_STATUSES.has(consultation.status)
  ).length;
  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;
  const completedAppointmentsCount = appointments.filter((appointment) => appointment.status === "completed").length;

  async function refreshAll() {
    await Promise.allSettled([
      profileQuery.refetch(),
      appointmentsQuery.refetch(),
      consultationsQuery.refetch(),
      notificationsQuery.refetch()
    ]);
  }

  return {
    currentUser,
    profile,
    nextAppointment: upcomingAppointments[0] ?? null,
    upcomingAppointmentsCount: upcomingAppointments.length,
    completedAppointmentsCount,
    activeConsultationsCount,
    unreadNotificationsCount,
    totalConsultationsCount: consultations.length,
    profileCompletion: calculateProfileCompletion(profile),
    age: calculateAge(profile?.dateOfBirth),
    isLoading: profileQuery.isLoading && !profile,
    isRefreshing:
      (profileQuery.isFetching && !profileQuery.isLoading) ||
      (appointmentsQuery.isFetching && !appointmentsQuery.isLoading) ||
      (consultationsQuery.isFetching && !consultationsQuery.isLoading) ||
      (notificationsQuery.isFetching && !notificationsQuery.isLoading),
    isError: profileQuery.isError && !profile,
    refetchProfile: profileQuery.refetch,
    refreshAll
  };
}

function calculateAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDifference = now.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function calculateProfileCompletion(
  profile:
    | {
        dateOfBirth?: string | null;
        city?: string | null;
        region?: string | null;
        bloodType?: string | null;
        chronicDiseases?: string | null;
        currentMedications?: string | null;
        user?: { profileImageUrl?: string | null };
      }
    | null
    | undefined
) {
  if (!profile) {
    return 0;
  }

  const fields = [
    profile.dateOfBirth,
    profile.city,
    profile.region,
    profile.bloodType,
    profile.chronicDiseases,
    profile.currentMedications,
    profile.user?.profileImageUrl
  ];
  const completed = fields.filter(Boolean).length;

  return Math.round((completed / fields.length) * 100);
}
