import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation } from "@/shared/animations/presets";

export function HomeQuickActionCard({
  title,
  icon,
  onPress
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);

  return (
    <Animated.View entering={entranceAnimation} style={styles.item}>
      <Pressable onPress={onPress} style={styles.pressable}>
        <View style={styles.iconGlow}>
          <View style={styles.iconShell}>
            <Ionicons name={icon} size={24} color={patientPalette.primary} />
          </View>
        </View>
        <Text style={styles.label}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    item: {
      flex: 1
    },
    pressable: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12
    },
    iconGlow: {
      width: 84,
      height: 84,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${patientPalette.accent}14`,
      shadowColor: patientPalette.accent,
      shadowOpacity: 0.22,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10
    },
    iconShell: {
      width: 62,
      height: 62,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: patientPalette.panel,
      borderWidth: 1,
      borderColor: `${patientPalette.accent}24`
    },
    label: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 15
    }
  });
}
