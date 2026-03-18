import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AdminStackParamList } from "@/navigation/types";
import { PlaceholderScreen } from "@/shared/components/PlaceholderScreen";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AdminDashboard"
        component={PlaceholderScreen}
        initialParams={{ title: "لوحة الأدمن", description: "المسارات الأساسية لإدارة الأطباء والمستخدمين جاهزة." }}
      />
    </Stack.Navigator>
  );
}

