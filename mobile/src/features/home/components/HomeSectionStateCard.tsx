import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation } from "@/shared/animations/presets";

type HomeSectionStateCardTone = "default" | "danger";

export function HomeSectionStateCard({
  title,
  description,
  actionLabel,
  onActionPress,
  isLoading = false,
  tone = "default"
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  isLoading?: boolean;
  tone?: HomeSectionStateCardTone;
}) {
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);
  const accentColor = tone === "danger" ? patientPalette.red : patientPalette.primary;

  return (
    <Animated.View entering={entranceAnimation}>
      <PatientSurface style={styles.container}>
        {isLoading ? <ActivityIndicator size="small" color={accentColor} /> : null}
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {actionLabel && onActionPress ? (
          <Pressable
            onPress={onActionPress}
            style={[styles.button, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}2A` }]}
          >
            <Text style={[styles.buttonLabel, { color: accentColor }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </PatientSurface>
    </Animated.View>
  );
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    container: {
      minHeight: 144,
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      paddingVertical: 24
    },
    copy: {
      gap: 6,
      alignItems: "center"
    },
    title: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 18,
      textAlign: "center"
    },
    description: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 14,
      lineHeight: 24,
      textAlign: "center"
    },
    button: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1
    },
    buttonLabel: {
      fontFamily: "Cairo_700Bold",
      fontSize: 14
    }
  });
}
