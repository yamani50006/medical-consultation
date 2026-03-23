import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationSurface({
  children,
  style
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = useConsultationTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: palette.border,
          shadowColor: palette.shadow
        },
        style
      ]}
    >
      <LinearGradient
        colors={[palette.surfaceStrong, palette.surface]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.highlight, { borderColor: palette.highlight }]} />
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
    gap: 12,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10
    },
    elevation: 8
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1
  }
});
