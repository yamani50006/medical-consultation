import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ConsultationFilter } from "@/domain/entities/Consultation";
import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { ConsultationSurface } from "@/features/consultations/components/ConsultationSurface";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

const copyByFilter: Record<ConsultationFilter, { title: string; description: string }> = {
  all: {
    title: "لا توجد استشارات بعد",
    description: "ابدأ استشارة جديدة وسيظهر لك كل مسار المتابعة والتحديثات في هذه الصفحة."
  },
  active: {
    title: "لا توجد استشارات نشطة",
    description: "عند قبول طلب جديد أو بدء الشات سيظهر هنا مباشرة."
  },
  completed: {
    title: "لا توجد استشارات مكتملة",
    description: "بعد انتهاء أي استشارة سيصبح التقرير والتقييم متاحين هنا."
  },
  rejected: {
    title: "لا توجد استشارات مرفوضة",
    description: "الطلبات المرفوضة أو المحوّلة لمسار حضوري ستظهر في هذا التصنيف."
  },
  archived: {
    title: "الأرشيف فارغ",
    description: "يمكنك أرشفة الاستشارات القديمة أو المكتملة للاحتفاظ بالقائمة الأساسية مرتبة."
  }
};

export function EmptyConsultationsState({
  activeFilter,
  onCreate
}: {
  activeFilter: ConsultationFilter;
  onCreate?: () => void;
}) {
  const palette = useConsultationTheme();
  const copy = copyByFilter[activeFilter];

  return (
    <ConsultationSurface style={{ alignItems: "center", paddingVertical: 28 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.tones.brand.background,
          borderWidth: 1,
          borderColor: palette.tones.brand.border
        }}
      >
        <Ionicons name="document-text-outline" size={28} color={palette.primary} />
      </View>
      <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 20, textAlign: "center" }}>{copy.title}</Text>
      <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "center", lineHeight: 24 }}>
        {copy.description}
      </Text>
      {onCreate ? <ConsultationButton title="طلب استشارة جديدة" onPress={onCreate} /> : null}
    </ConsultationSurface>
  );
}
