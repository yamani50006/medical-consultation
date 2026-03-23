import { Text, View } from "react-native";

import { ConsultationEntity } from "@/domain/entities/Consultation";
import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

type Props = {
  consultation: ConsultationEntity;
  onOpenChat?: () => void;
  onPayNow?: () => void;
  onDownloadReport?: () => void;
  onReopen?: () => void;
  onArchive?: () => void;
  loadingState?: {
    paying?: boolean;
    reopening?: boolean;
    archiving?: boolean;
  };
};

export function ConsultationActionButtons({
  consultation,
  onOpenChat,
  onPayNow,
  onDownloadReport,
  onReopen,
  onArchive,
  loadingState
}: Props) {
  const palette = useConsultationTheme();

  const actions = [
    consultation.canOpenChat && onOpenChat
      ? <ConsultationButton key="chat" title="فتح الشات" onPress={onOpenChat} style={{ flex: 1 }} />
      : null,
    consultation.canPay && onPayNow
      ? <ConsultationButton key="pay" title="ادفع الآن" onPress={onPayNow} loading={loadingState?.paying} style={{ flex: 1 }} />
      : null,
    consultation.canDownloadReport && onDownloadReport
      ? <ConsultationButton key="report" title="تحميل التقرير PDF" variant="secondary" onPress={onDownloadReport} style={{ flex: 1 }} />
      : null,
    consultation.canReopen && onReopen
      ? <ConsultationButton key="reopen" title="إعادة فتح الاستشارة" variant="secondary" onPress={onReopen} loading={loadingState?.reopening} style={{ flex: 1 }} />
      : null,
    consultation.canArchive && onArchive
      ? <ConsultationButton key="archive" title="أرشفة الاستشارة" variant="ghost" onPress={onArchive} loading={loadingState?.archiving} style={{ flex: 1 }} />
      : null
  ].filter(Boolean);

  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 }}>{actions}</View>
      {consultation.canReopen ? (
        <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 21 }}>
          يمكن إعادة الفتح خلال فترة قصيرة بعد الإغلاق إذا كانت المتابعة ضمن نفس الحالة ولم يبدأ علاج جديد.
        </Text>
      ) : null}
    </View>
  );
}
