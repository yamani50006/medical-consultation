import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { DoctorEntity } from "@/domain/entities/Doctor";
import { ConsultationAvatar } from "@/features/consultations/components/ConsultationAvatar";
import { ConsultationPricePill } from "@/features/consultations/components/ConsultationPricePill";
import { ConsultationSurface } from "@/features/consultations/components/ConsultationSurface";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { entranceAnimation } from "@/shared/animations/presets";

export function ConsultationDoctorPickerCard({
  doctor,
  selected = false,
  onPress
}: {
  doctor: DoctorEntity;
  selected?: boolean;
  onPress?: () => void;
}) {
  const palette = useConsultationTheme();

  return (
    <Animated.View entering={entranceAnimation}>
      <Pressable onPress={onPress}>
        <ConsultationSurface
          style={{
            borderColor: selected ? palette.primary : palette.border,
            backgroundColor: selected ? `${palette.primary}06` : undefined
          }}
        >
          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12
            }}
          >
            <View style={{ flex: 1, gap: 4, alignItems: "flex-end" }}>
              <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>
                {doctor.fullName}
              </Text>
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>
                {doctor.specialization}
              </Text>
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>
                {doctor.city ?? "عن بُعد"} {doctor.region ? `• ${doctor.region}` : ""}
              </Text>
            </View>
            <ConsultationAvatar name={doctor.fullName} imageUrl={doctor.profileImageUrl} />
          </View>

          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12
            }}
          >
            <ConsultationPricePill value={doctor.consultationFee} />
            <View
              style={{
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 8
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 10,
                  backgroundColor: doctor.isAvailableNow ? palette.success : palette.borderStrong
                }}
              />
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 12 }}>
                {doctor.isAvailableNow ? "متصل الآن" : "غير متصل"}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
              <Ionicons name="star" size={16} color="#F5A524" />
              <Text style={{ color: palette.text, fontFamily: "Cairo_600SemiBold" }}>
                {doctor.rating.toFixed(1)}
              </Text>
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium" }}>
                ({doctor.reviewsCount})
              </Text>
            </View>
            <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>
              {doctor.yearsOfExperience} سنة خبرة
            </Text>
          </View>
        </ConsultationSurface>
      </Pressable>
    </Animated.View>
  );
}
