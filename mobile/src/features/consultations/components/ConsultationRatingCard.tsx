import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ConsultationRatingEntity } from "@/domain/entities/Consultation";
import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationRatingCard({
  rating,
  selectedScore,
  onSelectScore,
  onSubmit,
  loading
}: {
  rating?: ConsultationRatingEntity | null;
  selectedScore: number;
  onSelectScore: (score: number) => void;
  onSubmit: () => void;
  loading?: boolean;
}) {
  const palette = useConsultationTheme();

  if (rating) {
    return (
      <View style={{ gap: 10 }}>
        <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 16, textAlign: "right" }}>
          تم إرسال التقييم
        </Text>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
          {Array.from({ length: rating.score }).map((_, index) => (
            <Ionicons key={index} name="star" size={18} color="#F5A524" />
          ))}
        </View>
        {rating.comment ? (
          <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 22 }}>
            {rating.comment}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 16, textAlign: "right" }}>
        قيّم الطبيب بعد اكتمال الاستشارة
      </Text>
      <View style={{ flexDirection: "row-reverse", gap: 10, justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map((score) => {
          const active = score <= selectedScore;
          return (
            <Pressable key={score} onPress={() => onSelectScore(score)}>
              <Ionicons
                name={active ? "star" : "star-outline"}
                size={28}
                color={active ? "#F5A524" : palette.textMuted}
              />
            </Pressable>
          );
        })}
      </View>
      <ConsultationButton title="حفظ التقييم" onPress={onSubmit} disabled={!selectedScore} loading={loading} />
    </View>
  );
}
