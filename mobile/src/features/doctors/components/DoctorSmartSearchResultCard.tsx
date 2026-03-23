import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DoctorEntity } from "@/domain/entities/Doctor";
import { PatientPalette, usePatientPalette } from "@/features/home/components/patient-theme";
import { entranceAnimation, listLayoutAnimation } from "@/shared/animations/presets";
import { Avatar } from "@/shared/components/Avatar";

export function DoctorSmartSearchResultCard({
  doctor,
  onBookPress,
  onProfilePress
}: {
  doctor: DoctorEntity;
  onBookPress: () => void;
  onProfilePress: () => void;
}) {
  const patientPalette = usePatientPalette();
  const styles = createStyles(patientPalette);
  const matchScore = Math.max(0, Math.min(99, Math.round(doctor.recommendation?.totalScore ?? 0)));
  const primaryReason = translateRecommendationReason(doctor.recommendation?.reasons?.[0]);

  return (
    <Animated.View entering={entranceAnimation} layout={listLayoutAnimation}>
      <View style={styles.card}>
        <View style={styles.scoreBadge}>
          <Ionicons name="sparkles" size={11} color={patientPalette.primary} />
          <Text style={styles.scoreText}>{matchScore}%</Text>
        </View>

        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <Avatar
              name={doctor.fullName}
              imageUrl={doctor.profileImageUrl}
              size={66}
              backgroundColor={`${patientPalette.accent}20`}
              textColor={patientPalette.accent}
            />
            <View
              style={[
                styles.presenceDot,
                { backgroundColor: doctor.isAvailableNow ? patientPalette.green : patientPalette.line }
              ]}
            />
          </View>

          <View style={styles.content}>
            <Text numberOfLines={1} style={styles.name}>
              {doctor.fullName}
            </Text>
            <Text numberOfLines={2} style={styles.specialization}>
              {doctor.specialization}
            </Text>
            <Text numberOfLines={1} style={styles.metaLine}>
              {doctor.city || "عن بُعد"} {doctor.region ? `• ${doctor.region}` : ""}
            </Text>
            {primaryReason ? (
              <View style={styles.reasonPill}>
                <Text numberOfLines={1} style={styles.reasonText}>
                  {primaryReason}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatItem icon="star" label={`${doctor.rating.toFixed(1)}`} />
          <StatItem icon="briefcase-outline" label={`${doctor.yearsOfExperience} سنة`} />
          <StatItem icon="cash-outline" label={doctor.consultationFee ? `${doctor.consultationFee} ر.س` : "سعر مرن"} />
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={onProfilePress} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>الملف</Text>
          </Pressable>
          <Pressable onPress={onBookPress} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>احجز الآن</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  function StatItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
    return (
      <View style={styles.statPill}>
        <Ionicons name={icon} size={13} color={patientPalette.yellow} />
        <Text style={styles.statText}>{label}</Text>
      </View>
    );
  }
}

function createStyles(patientPalette: PatientPalette) {
  return StyleSheet.create({
    card: {
      overflow: "hidden",
      borderRadius: 28,
      borderWidth: 1,
      borderColor: patientPalette.glassBorder,
      backgroundColor: patientPalette.glass,
      padding: 16,
      gap: 14,
      shadowColor: patientPalette.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.24,
      shadowRadius: 24,
      elevation: 10
    },
    scoreBadge: {
      alignSelf: "flex-start",
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: `${patientPalette.primary}26`,
      backgroundColor: `${patientPalette.primary}12`,
      paddingHorizontal: 8,
      paddingVertical: 5
    },
    scoreText: {
      color: patientPalette.primary,
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    headerRow: {
      flexDirection: "row-reverse",
      gap: 12,
      alignItems: "center"
    },
    avatarWrap: {
      position: "relative"
    },
    presenceDot: {
      position: "absolute",
      bottom: 2,
      right: 4,
      width: 14,
      height: 14,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: patientPalette.page
    },
    content: {
      flex: 1,
      alignItems: "flex-end",
      gap: 3
    },
    name: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 19
    },
    specialization: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_600SemiBold",
      fontSize: 13,
      textAlign: "right",
      lineHeight: 22
    },
    metaLine: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_500Medium",
      fontSize: 12
    },
    reasonPill: {
      marginTop: 4,
      borderRadius: 999,
      backgroundColor: `${patientPalette.accent}14`,
      borderWidth: 1,
      borderColor: `${patientPalette.accent}24`,
      paddingHorizontal: 10,
      paddingVertical: 5
    },
    reasonText: {
      color: patientPalette.accent,
      fontFamily: "Cairo_700Bold",
      fontSize: 11
    },
    statsRow: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 8
    },
    statPill: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 5,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: patientPalette.panelSoft
    },
    statText: {
      color: patientPalette.text,
      fontFamily: "Cairo_700Bold",
      fontSize: 12
    },
    actionsRow: {
      flexDirection: "row-reverse",
      gap: 10
    },
    primaryAction: {
      flex: 1,
      minHeight: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#7AF2E7"
    },
    primaryActionText: {
      color: "#07333B",
      fontFamily: "Cairo_700Bold",
      fontSize: 14
    },
    secondaryAction: {
      minWidth: 86,
      minHeight: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: patientPalette.line,
      backgroundColor: patientPalette.panelSoft
    },
    secondaryActionText: {
      color: patientPalette.textMuted,
      fontFamily: "Cairo_700Bold",
      fontSize: 14
    }
  });
}

function translateRecommendationReason(value?: string) {
  if (!value) {
    return null;
  }

  const map: Record<string, string> = {
    "Strong specialty match": "مطابقة قوية للحالة",
    "Same city as patient": "في نفس مدينة المريض",
    "Near the patient region": "قريب من منطقتك",
    "Highly rated by patients": "تقييم مرتفع من المرضى",
    "Experienced with many consultations": "خبرة واسعة في الاستشارات",
    "Available right now": "متاح الآن",
    "Supports online consultation": "يدعم الأونلاين",
    "Supports in-person consultation": "يدعم الحضور",
    "Within the requested budget": "ضمن السعر المطلوب"
  };

  return map[value] ?? value;
}
