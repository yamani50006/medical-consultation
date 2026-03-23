import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { DoctorEntity } from "@/domain/entities/Doctor";
import { entranceAnimation } from "@/shared/animations/presets";
import { Avatar } from "@/shared/components/Avatar";
import { Card } from "@/shared/components/Card";
import { PriceTag } from "@/shared/components/PriceTag";
import { RatingStars } from "@/shared/components/RatingStars";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function DoctorCard({ doctor, onPress }: { doctor: DoctorEntity; onPress?: () => void }) {
  const { theme } = useAppTheme();
  const primaryReason = translateRecommendationReason(doctor.recommendation?.reasons?.[0]);

  return (
    <Animated.View entering={entranceAnimation}>
      <Pressable onPress={onPress}>
        <Card>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.colors.text.primary }]}>{doctor.fullName}</Text>
              <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>{doctor.specialization}</Text>
              {doctor.recommendation?.totalScore ? (
                <View style={[styles.smartBadge, { backgroundColor: `${theme.colors.brand.primary}14`, borderColor: `${theme.colors.brand.primary}2A` }]}>
                  <Text style={[styles.smartBadgeText, { color: theme.colors.brand.primary }]}>
                    مطابقة ذكية {Math.round(doctor.recommendation.totalScore)}%
                  </Text>
                </View>
              ) : null}
              <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
                {doctor.city ?? "عن بُعد"} {doctor.region ? `• ${doctor.region}` : ""}
              </Text>
              {primaryReason ? <Text style={[styles.reason, { color: theme.colors.brand.accent }]}>{primaryReason}</Text> : null}
            </View>
            <Avatar name={doctor.fullName} imageUrl={doctor.profileImageUrl} />
          </View>
          <View style={styles.row}>
            <PriceTag value={doctor.consultationFee} />
            <StatusBadge active={doctor.isAvailableNow} />
          </View>
          <View style={styles.row}>
            <RatingStars rating={doctor.rating} count={doctor.reviewsCount} />
            <Text style={[styles.meta, { color: theme.colors.text.secondary }]}>
              {doctor.yearsOfExperience} سنة خبرة
            </Text>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 12 },
  info: { flex: 1, gap: 4, alignItems: "flex-end" },
  name: { fontFamily: "Cairo_700Bold", fontSize: 18 },
  meta: { fontFamily: "Cairo_500Medium", fontSize: 13 },
  smartBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-end"
  },
  smartBadgeText: {
    fontFamily: "Cairo_700Bold",
    fontSize: 11
  },
  reason: {
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12
  }
});

function translateRecommendationReason(value?: string) {
  if (!value) {
    return null;
  }

  const map: Record<string, string> = {
    "Strong specialty match": "تخصصه مطابق بقوة لطلبك",
    "Same city as patient": "في نفس مدينة المريض",
    "Near the patient region": "قريب من منطقتك",
    "Highly rated by patients": "تقييمه مرتفع من المرضى",
    "Experienced with many consultations": "لديه خبرة وعدد كبير من الاستشارات",
    "Available right now": "متاح الآن للاستشارة",
    "Supports online consultation": "يدعم الاستشارة الأونلاين",
    "Supports in-person consultation": "يدعم الزيارة الحضورية",
    "Within the requested budget": "ضمن الميزانية المطلوبة"
  };

  return map[value] ?? value;
}
