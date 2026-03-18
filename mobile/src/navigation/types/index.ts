import { NavigatorScreenParams } from "@react-navigation/native";
import { UserRole } from "@/core/enums/user-role";

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: { role: UserRole.Patient | UserRole.Doctor } | undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string } | undefined;
  ResetPassword: undefined;
  AccountType: undefined;
};

export type PatientTabParamList = {
  HomeTab: undefined;
  DoctorsTab: undefined;
  MessagesTab: undefined;
  AppointmentsTab: undefined;
  ProfileTab: undefined;
};

export type PatientStackParamList = {
  PatientTabs: NavigatorScreenParams<PatientTabParamList> | undefined;
  ConsultationRequest: undefined;
  StartBooking: undefined;
  DoctorDetails: { doctorId: string };
  Booking: { doctorId: string; doctorName?: string };
};

export type DoctorStackParamList = {
  DoctorTabs: undefined;
  DoctorDashboard: undefined;
  DoctorConsultationDetails: { requestId: string };
};

export type DoctorTabParamList = {
  DoctorDashboardTab: undefined;
  DoctorRequestsTab: undefined;
  DoctorAppointmentsTab: undefined;
  DoctorProfileTab: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: { title: string; description: string } | undefined;
};
