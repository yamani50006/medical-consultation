import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/shared/components/Avatar";
import { usePatientPalette } from "@/features/home/components/patient-theme";
import { useNotificationsQuery } from "@/features/notifications";

export function PatientHeader({
  title,
  subtitle = "مرحبًا بك",
  avatarName,
  avatarImageUrl,
  onNotificationPress,
  showNotificationButton = true,
  showBackButton = false,
  onBackPress
}: {
  title: string;
  subtitle?: string;
  avatarName?: string;
  avatarImageUrl?: string | null;
  onNotificationPress?: () => void;
  showNotificationButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
}) {
  const navigation = useNavigation<any>();
  const patientPalette = usePatientPalette();
  const notificationsQuery = useNotificationsQuery({ limit: 50, isRead: false });
  const unreadCount = notificationsQuery.data?.filter((item) => !item.isRead).length ?? 0;
  const iconShell = {
    width: 48,
    height: 48,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: patientPalette.panel,
    borderWidth: 1,
    borderColor: patientPalette.glassBorder,
    shadowColor: patientPalette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
      return;
    }

    navigation.navigate("Notifications");
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    navigation.goBack();
  };

  return (
    <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            padding: 3,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: patientPalette.glassBorder
          }}
        >
          <Avatar
            name={avatarName ?? title}
            imageUrl={avatarImageUrl}
            size={48}
            backgroundColor="#FFD0BE"
            textColor="#88554A"
          />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>{subtitle}</Text>
          <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 24 }}>{title}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row-reverse", gap: 10 }}>
        {showNotificationButton ? (
          <Pressable onPress={handleNotificationPress} style={iconShell}>
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
        ) : null}
        {showBackButton && navigation.canGoBack() ? (
          <Pressable onPress={handleBackPress} style={iconShell}>
            <Ionicons name="arrow-forward" size={19} color={patientPalette.text} style={{ transform: [{ rotate: "180deg" }] }} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
