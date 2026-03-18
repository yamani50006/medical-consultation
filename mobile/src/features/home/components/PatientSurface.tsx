import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { patientPalette } from "@/features/home/components/patient-theme";

export function PatientSurface({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.015)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.innerBorder} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: patientPalette.glassBorder,
    backgroundColor: patientPalette.glass,
    padding: 16,
    shadowColor: patientPalette.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 10
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)"
  }
});

