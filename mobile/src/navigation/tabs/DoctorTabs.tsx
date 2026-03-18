import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import {
  DoctorAppointmentsScreen,
  DoctorDashboardScreen,
  DoctorProfileScreen,
  DoctorRequestsScreen
} from "@/features/doctor-panel";
import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";
import { DoctorTabParamList } from "@/navigation/types";

const Tab = createBottomTabNavigator<DoctorTabParamList>();

export function DoctorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: doctorPalette.header,
          borderTopColor: doctorPalette.lineSoft,
          height: 76,
          paddingTop: 8
        },
        tabBarActiveTintColor: doctorPalette.primary,
        tabBarInactiveTintColor: doctorPalette.textMuted,
        tabBarLabelStyle: {
          fontFamily: "Cairo_700Bold",
          fontSize: 12
        },
        sceneStyle: {
          backgroundColor: doctorPalette.page
        },
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === "DoctorDashboardTab"
              ? "home"
              : route.name === "DoctorRequestsTab"
                ? "clipboard"
                : route.name === "DoctorAppointmentsTab"
                  ? "calendar"
                  : "person";
          return <Ionicons name={icon} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="DoctorDashboardTab" component={DoctorDashboardScreen} options={{ title: "الرئيسية" }} />
      <Tab.Screen name="DoctorRequestsTab" component={DoctorRequestsScreen} options={{ title: "الطلبات" }} />
      <Tab.Screen name="DoctorAppointmentsTab" component={DoctorAppointmentsScreen} options={{ title: "مواعيدي" }} />
      <Tab.Screen name="DoctorProfileTab" component={DoctorProfileScreen} options={{ title: "الملف" }} />
    </Tab.Navigator>
  );
}
