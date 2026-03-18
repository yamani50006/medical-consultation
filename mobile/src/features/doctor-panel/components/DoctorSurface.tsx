import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { doctorPalette } from "@/features/doctor-panel/components/doctor-theme";

export function DoctorSurface({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.01)"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.innerBorder} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: doctorPalette.lineSoft,
    backgroundColor: doctorPalette.panel,
    padding: 18,
    shadowColor: doctorPalette.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.36,
    shadowRadius: 28,
    elevation: 10
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    borderRadius: 28
  }
});

