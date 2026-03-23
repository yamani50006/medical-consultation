import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { authPalette } from "@/features/auth/components/auth-theme";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
};

export function AuthButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  style
}: Props) {
  const isDisabled = Boolean(loading || disabled);
  const palette =
    variant === "primary"
      ? { text: authPalette.black, background: "transparent", border: "transparent", spinner: authPalette.black }
      : variant === "secondary"
        ? { text: authPalette.text, background: authPalette.surfaceSoft, border: authPalette.border, spinner: authPalette.text }
        : { text: authPalette.accent, background: "transparent", border: "transparent", spinner: authPalette.accent };

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: variant === "secondary" ? palette.background : "transparent",
          borderColor: palette.border,
          opacity: isDisabled ? 0.58 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.988 : 1 }]
        },
        style
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={[authPalette.accent, authPalette.accentStrong]}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={palette.spinner} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={palette.text} /> : null}
          <Text style={[styles.label, { color: palette.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 18
  },
  content: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  label: {
    fontFamily: "Cairo_700Bold",
    fontSize: 16
  }
});
