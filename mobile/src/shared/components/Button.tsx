import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
};

export function Button({ title, onPress, loading, disabled, variant = "primary", style }: Props) {
  const { theme } = useAppTheme();
  const isDisabled = Boolean(loading || disabled);
  const palette =
    variant === "primary"
      ? { backgroundColor: "transparent", color: theme.colors.text.inverse, borderColor: "transparent" }
      : variant === "secondary"
        ? { backgroundColor: theme.colors.glass.surface, color: theme.colors.text.primary, borderColor: theme.colors.glass.border }
        : { backgroundColor: "transparent", color: theme.colors.brand.primary, borderColor: "transparent" };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: isDisabled ? 0.6 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }]
        },
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={[theme.colors.brand.primary, theme.colors.brand.accent]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      {loading ? <ActivityIndicator color={palette.color} /> : <Text style={[styles.label, { color: palette.color }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    overflow: "hidden",
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  label: {
    fontFamily: "Cairo_700Bold",
    fontSize: 15
  }
});
