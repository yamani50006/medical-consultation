import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  style?: ViewStyle;
};

export function ConsultationButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style
}: Props) {
  const palette = useConsultationTheme();
  const isDisabled = Boolean(loading || disabled);
  const colors =
    variant === "primary"
      ? {
          text: palette.contrastText,
          background: "transparent",
          border: "transparent"
        }
      : variant === "outline"
        ? {
            text: palette.primary,
            background: palette.surface,
            border: `${palette.primary}36`
          }
      : variant === "secondary"
        ? {
            text: palette.text,
            background: palette.surfaceStrong,
            border: palette.border
          }
        : {
            text: palette.textMuted,
            background: palette.surfaceMuted,
            border: "transparent"
          };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }]
        },
        style
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={[palette.primary, palette.accent]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  label: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15
  }
});
