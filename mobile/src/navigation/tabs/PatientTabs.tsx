import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { AppointmentsListScreen } from "@/features/appointments";
import { MessagesScreen } from "@/features/chat";
import { DoctorsListScreen } from "@/features/doctors";
import { HomeScreen } from "@/features/home";
import { patientPalette } from "@/features/home/components/patient-theme";
import { ProfileScreen } from "@/features/profile";
import { PatientTabParamList } from "@/navigation/types";

const Tab = createBottomTabNavigator<PatientTabParamList>();

export function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: patientPalette.primary,
        tabBarInactiveTintColor: patientPalette.textMuted,
        tabBarStyle: {
          backgroundColor: patientPalette.header,
          borderTopColor: patientPalette.glassBorder,
          height: 78,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontFamily: "Cairo_700Bold",
          fontSize: 12
        },
        sceneStyle: {
          backgroundColor: patientPalette.page
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "HomeTab"
              ? "home"
              : route.name === "DoctorsTab"
                ? "medical"
                : route.name === "MessagesTab"
                  ? "chatbox"
                  : route.name === "AppointmentsTab"
                    ? "calendar"
                    : "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "الرئيسية" }} />
      <Tab.Screen name="DoctorsTab" component={DoctorsListScreen} options={{ title: "الأطباء" }} />
      <Tab.Screen name="MessagesTab" component={MessagesScreen} options={{ title: "الرسائل" }} />
      <Tab.Screen name="AppointmentsTab" component={AppointmentsListScreen} options={{ title: "مواعيدي" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "حسابي" }} />
    </Tab.Navigator>
  );
}
