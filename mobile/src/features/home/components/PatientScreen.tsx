import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePatientPalette } from "@/features/home/components/patient-theme";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function PatientScreen({ children }: { children: ReactNode }) {
  const patientPalette = usePatientPalette();
  const { scheme } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: patientPalette.page }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[patientPalette.page, patientPalette.panelSoft, patientPalette.page]}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient colors={[`${patientPalette.accent}18`, "transparent"]} style={styles.glowA} />
        <LinearGradient colors={[`${patientPalette.primary}1F`, "transparent"]} style={styles.glowB} />
        <View style={[styles.grid, { borderColor: scheme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(84,100,118,0.08)" }]} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 16,
    overflow: "hidden"
  },
  glowA: {
    position: "absolute",
    top: -70,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 220
  },
  glowB: {
    position: "absolute",
    bottom: -90,
    left: -30,
    width: 260,
    height: 260,
    borderRadius: 260
  },
  grid: {
    position: "absolute",
    top: -120,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    transform: [{ rotate: "15deg" }]
  }
});
