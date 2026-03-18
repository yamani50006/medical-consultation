import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function ScreenHeader({
  title,
  subtitle,
  showBack = true
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text> : null}
      </View>
      {showBack && navigation.canGoBack() ? (
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.colors.glass.surface,
              borderColor: theme.colors.glass.border
            }
          ]}
        >
          <Ionicons name="arrow-forward" size={20} color={theme.colors.text.primary} />
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

