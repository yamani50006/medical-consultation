import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: theme.colors.glass.border,
          shadowColor: theme.colors.glass.shadow
        },
        theme.shadows.card,
        style
      ]}
    >
      <LinearGradient
        colors={[theme.colors.glass.surfaceStrong, theme.colors.glass.surface]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.highlight, { borderColor: theme.colors.glass.highlight }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 24
  }
});
