import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/shared/components/Avatar";
import { patientPalette } from "@/features/home/components/patient-theme";
import { useNotificationsQuery } from "@/features/notifications";

export function PatientHeader({
  title,
  subtitle = "مرحبًا بك",
  onNotificationPress
}: {
  title: string;
  subtitle?: string;
  onNotificationPress?: () => void;
}) {
  const notificationsQuery = useNotificationsQuery({ limit: 10, isRead: false });
  const unreadCount = notificationsQuery.data?.filter((item) => !item.isRead).length ?? 0;

  return (
    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
        <Avatar name={title} size={50} />
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>{subtitle}</Text>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 22 }}>{title}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row-reverse", gap: 10 }}>
        <Pressable onPress={onNotificationPress} style={iconShell}>
          <Ionicons name="notifications" size={19} color={patientPalette.text} />
          {unreadCount > 0 ? (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                minWidth: 18,
                height: 18,
                borderRadius: 999,
                paddingHorizontal: 4,
                backgroundColor: patientPalette.primary,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 10 }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const iconShell = {
  width: 46,
  height: 46,
  borderRadius: 16,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: patientPalette.panel,
  borderWidth: 1,
  borderColor: patientPalette.glassBorder
};
