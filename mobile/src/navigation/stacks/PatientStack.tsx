import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BookingScreen, StartBookingScreen } from "@/features/appointments";
import { ConsultationRequestScreen } from "@/features/consultations";
import { DoctorDetailsScreen } from "@/features/doctors";
import { PatientTabs } from "@/navigation/tabs/PatientTabs";
import { PatientStackParamList } from "@/navigation/types";

const Stack = createNativeStackNavigator<PatientStackParamList>();

export function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      <Stack.Screen name="ConsultationRequest" component={ConsultationRequestScreen} />
      <Stack.Screen name="StartBooking" component={StartBookingScreen} />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
    </Stack.Navigator>
  );
}
