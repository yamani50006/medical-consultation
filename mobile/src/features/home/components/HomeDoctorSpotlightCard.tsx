import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { DoctorEntity } from "@/domain/entities/Doctor";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation } from "@/shared/animations/presets";
import { Avatar } from "@/shared/components/Avatar";

export function HomeDoctorSpotlightCard({
  doctor,
  onPress
}: {
  doctor: DoctorEntity;
  onPress?: () => void;
}) {
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);

  return (
    <Animated.View entering={entranceAnimation}>
      <Pressable onPress={onPress}>
        <PatientSurface style={styles.card}>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color={patientPalette.yellow} />
            <Text style={styles.ratingValue}>{doctor.rating.toFixed(1)}</Text>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.avatarShell}>
              <Avatar
                name={doctor.fullName}
                imageUrl={doctor.profileImageUrl}
                size={64}
                backgroundColor="#D7EEF9"
                textColor="#286B86"
              />
            </View>
            <View style={styles.copy}>
              <Text numberOfLines={2} style={styles.name}>
                {doctor.fullName}
              </Text>
              <Text numberOfLines={1} style={styles.specialization}>
                {doctor.specialization}
              </Text>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: doctor.isAvailableNow ? `${patientPalette.primary}18` : patientPalette.panelSoft,
                    borderColor: doctor.isAvailableNow ? `${patientPalette.primary}26` : patientPalette.glassBorder
                  }
                ]}
              >
                <Text
                  style={[
                    styles.statusLabel,
                    { color: doctor.isAvailableNow ? patientPalette.primary : patientPalette.textMuted }
                  ]}
                >
                  {doctor.isAvailableNow ? "متاح الآن" : "مشغول"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLabel}>السعر حسب الحالة</Text>
            <Text style={styles.footerValue}>{doctor.consultationFee ? `${doctor.consultationFee} ر.س` : "مرن"}</Text>
          </View>
        </PatientSurface>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    card: {
      width: 166,
      minHeight: 222,
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 14,
      paddingBottom: 12
    },
    ratingPill: {
      alignSelf: "flex-start",
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.04)",
      borderWidth: 1,
      borderColor: patientPalette.glassBorder
    },
    ratingValue: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    mainContent: {
      alignItems: "center",
      gap: 12
    },
    avatarShell: {
      width: 86,
      height: 86,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${patientPalette.accent}14`,
      borderWidth: 1,
      borderColor: `${patientPalette.accent}24`
    },
    copy: {
      alignItems: "center",
      gap: 4
    },
    name: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 16,
      textAlign: "center"
    },
    specialization: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 12
    },
    statusPill: {
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1
    },
    statusLabel: {
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    footer: {
      width: "100%",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: patientPalette.lineSoft,
      alignItems: "center",
      gap: 2
    },
    footerLabel: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 11
    },
    footerValue: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    }
  });
}
