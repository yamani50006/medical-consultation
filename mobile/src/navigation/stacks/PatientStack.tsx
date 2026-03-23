import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BookingScreen, StartBookingScreen } from "@/features/appointments";
import {
  ConsultationDetailsScreen,
  ConsultationRequestScreen,
  ConsultationsScreen
} from "@/features/consultations";
import { DoctorDetailsScreen } from "@/features/doctors/screens/DoctorDetailsScreen";
import { NotificationsScreen } from "@/features/notifications";
import { EditPatientProfileScreen } from "@/features/profile";
import { PatientTabs } from "@/navigation/tabs/PatientTabs";
import { PatientStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<PatientStackParamList>();

export function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="MyConsultations" component={ConsultationsScreen} />
      <Stack.Screen name="ConsultationDetails" component={ConsultationDetailsScreen} />
      <Stack.Screen name="ConsultationRequest" component={ConsultationRequestScreen} />
      <Stack.Screen name="StartBooking" component={StartBookingScreen} />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="EditPatientProfile" component={EditPatientProfileScreen} />
    </Stack.Navigator>
  );
}
