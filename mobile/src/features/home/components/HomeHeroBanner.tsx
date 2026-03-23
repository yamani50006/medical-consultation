import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation } from "@/shared/animations/presets";

export function HomeHeroBanner({
  title,
  description,
  ctaLabel,
  onPress
}: {
  title: string;
  description: string;
  ctaLabel: string;
  onPress?: () => void;
}) {
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);

  return (
    <Animated.View entering={entranceAnimation}>
      <PatientSurface style={styles.container}>
        <LinearGradient
          colors={["#31BDB4", "#26AEA7", "#229A95"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlayGlow}
        />

        <View style={styles.medkitBlock}>
          <Ionicons name="medkit" size={46} color="rgba(8, 67, 73, 0.45)" />
        </View>
        <View style={styles.medkitHandle} />

        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <Pressable onPress={onPress} style={styles.button}>
          <Text style={styles.buttonLabel}>{ctaLabel}</Text>
        </Pressable>
      </PatientSurface>
    </Animated.View>
  );
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    container: {
      minHeight: 168,
      justifyContent: "space-between",
      overflow: "hidden",
      padding: 18
    },
    overlayGlow: {
      position: "absolute",
      inset: 0,
      opacity: 0.85
    },
    medkitBlock: {
      position: "absolute",
      left: 24,
      top: 26,
      width: 102,
      height: 86,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent: "center"
    },
    medkitHandle: {
      position: "absolute",
      left: 52,
      top: 10,
      width: 22,
      height: 42,
      borderRadius: 11,
      backgroundColor: "rgba(255,255,255,0.16)"
    },
    copy: {
      alignItems: "flex-end",
      paddingLeft: 106,
      gap: 6
    },
    title: {
      color: "#FFFFFF",
      fontFamily: "Cairo_700Bold",
      fontSize: 34
    },
    description: {
      color: "rgba(255,255,255,0.9)",
      fontFamily: "Cairo_500Medium",
      lineHeight: 24,
      textAlign: "right"
    },
    button: {
      alignSelf: "flex-end",
      backgroundColor: "#F7FFFE",
      paddingHorizontal: 22,
      paddingVertical: 11,
      borderRadius: 999,
      shadowColor: "rgba(0,0,0,0.18)",
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6
    },
    buttonLabel: {
      color: patientPalette.primaryStrong,
      fontFamily: "Cairo_700Bold",
      fontSize: 15
    }
  });
}
