import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DoctorStackParamList } from "@/navigation/types";
import { DoctorTabs } from "@/navigation/tabs/DoctorTabs";

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export function DoctorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
    </Stack.Navigator>
  );
}
