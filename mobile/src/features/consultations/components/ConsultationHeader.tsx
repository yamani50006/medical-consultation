import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationHeader({
  title,
  subtitle,
  showBack = true
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  const palette = useConsultationTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {showBack && navigation.canGoBack() ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            {
              backgroundColor: palette.surfaceMuted,
              borderColor: palette.border
            }
          ]}
        >
          <Ionicons name="arrow-forward" size={20} color={palette.text} style={{ transform: [{ rotate: "180deg" }] }} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16
  },
  textBlock: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2
  },
  title: {
    fontFamily: "Cairo_700Bold",
    fontSize: 28
  },
  subtitle: {
    fontFamily: "Cairo_500Medium",
    fontSize: 14
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
