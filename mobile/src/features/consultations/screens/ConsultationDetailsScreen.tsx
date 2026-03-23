import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Linking, StyleSheet, Text, View } from "react-native";
import { ReactNode, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

import { appQueryKeys } from "@/app/di/query-keys";
import { ConsultationAttachmentEntity } from "@/domain/entities/Consultation";
import { ConsultationActionButtons } from "@/features/consultations/components/ConsultationActionButtons";
import { ConsultationAttachmentList } from "@/features/consultations/components/ConsultationAttachmentList";
import { ConsultationErrorState } from "@/features/consultations/components/ConsultationErrorState";
import { ConsultationHeader } from "@/features/consultations/components/ConsultationHeader";
import { ConsultationLoader } from "@/features/consultations/components/ConsultationLoader";
import { ConsultationMessagesPreview } from "@/features/consultations/components/ConsultationMessagesPreview";
import { ConsultationNotificationBanner } from "@/features/consultations/components/ConsultationNotificationBanner";
import { ConsultationPricePill } from "@/features/consultations/components/ConsultationPricePill";
import { ConsultationRatingCard } from "@/features/consultations/components/ConsultationRatingCard";
import { ConsultationScreenLayout } from "@/features/consultations/components/ConsultationScreenLayout";
import { ConsultationStatusBadge } from "@/features/consultations/components/ConsultationStatusBadge";
import { ConsultationSurface } from "@/features/consultations/components/ConsultationSurface";
import { ConsultationTimeline } from "@/features/consultations/components/ConsultationTimeline";
import { DoctorMiniProfile } from "@/features/consultations/components/DoctorMiniProfile";
import { SimilarDoctorsSection } from "@/features/consultations/components/SimilarDoctorsSection";
import {
  consultationPaymentStatusMap
} from "@/features/consultations/constants/consultation-status";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { useConsultationDetails } from "@/features/consultations/hooks/useConsultationDetails";
import {
  formatConsultationDateTime,
  formatRequestType
} from "@/features/consultations/utils/consultation-formatters";
import { PatientStackParamList } from "@/navigation/types";
import { queryClient } from "@/shared/utils/query-client";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<PatientStackParamList, "ConsultationDetails">;

export function ConsultationDetailsScreen({ navigation, route }: Props) {
  const palette = useConsultationTheme();
  const showToast = useUiStore((state) => state.showToast);
  const [selectedScore, setSelectedScore] = useState(0);
  const { consultationId } = route.params;
  const { consultation, isLoading, isError, refetch, actions, actionState } =
    useConsultationDetails(consultationId);

  const handleOpenUrl = async (url?: string | null) => {
    if (!url) {
      showToast({
        title: "الرابط غير متاح",
        description: "لم يرفق الطبيب ملف التقرير أو المستند المطلوب بعد."
      });
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      showToast({
        title: "تعذر فتح الرابط",
        description: "تحقق من تهيئة روابط الملفات في الباك اند أو جرّب لاحقًا."
      });
    }
  };

  const handleOpenAttachment = (attachment: ConsultationAttachmentEntity) => {
    void handleOpenUrl(attachment.url);
  };

  const handleOpenChat = () => {
    void queryClient.invalidateQueries({ queryKey: appQueryKeys.conversationsRoot() });
    navigation.navigate("PatientTabs", { screen: "MessagesTab" });
  };

  return (
    <ConsultationScreenLayout>
      <ConsultationHeader title="تفاصيل الاستشارة" subtitle={consultation?.subject ?? "مسار المتابعة الكامل"} />

      {isLoading ? <ConsultationLoader /> : null}
      {isError ? <ConsultationErrorState message="تعذر تحميل تفاصيل الاستشارة" onRetry={refetch} /> : null}

      {consultation ? (
        <>
          <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 500 }}>
            <ConsultationSurface style={{ overflow: "hidden", gap: 16 }}>
              <LinearGradient colors={[palette.heroStart, palette.heroEnd]} style={StyleSheet.absoluteFillObject} />
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <ConsultationStatusBadge status={consultation.status} archived={Boolean(consultation.archivedAt)} />
                <Text style={{ color: palette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 12 }}>
                  أُنشئت {formatConsultationDateTime(consultation.createdAt)}
                </Text>
              </View>
              <DoctorMiniProfile
                doctorName={consultation.doctorName}
                doctorAvatarUrl={consultation.doctorAvatarUrl}
                specialization={consultation.specialization}
                availability={consultation.doctorAvailability}
              />
              <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "center" }}>
                <ConsultationPricePill value={consultation.price} />
                <MetaPill label={`النوع: ${formatRequestType(consultation.requestType)}`} />
                <MetaPill
                  label={`الدفع: ${consultationPaymentStatusMap[consultation.paymentStatus].label}`}
                />
                {consultation.preferredTime ? <MetaPill label={`الوقت المفضل: ${consultation.preferredTime}`} /> : null}
              </View>
              <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 20, textAlign: "right" }}>
                {consultation.subject}
              </Text>
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 24 }}>
                {consultation.description}
              </Text>
            </ConsultationSurface>
          </MotiView>

          {consultation.notifications.length ? (
            <View style={{ gap: 10 }}>
              {consultation.notifications.map((notification) => (
                <ConsultationNotificationBanner key={notification.id} notification={notification} />
              ))}
            </View>
          ) : null}

          <Section title="الإجراءات المتاحة">
            <ConsultationActionButtons
              consultation={consultation}
              onOpenChat={handleOpenChat}
              onPayNow={() => {
                void actions.payNow().then(() => {
                  navigation.navigate("PatientTabs", { screen: "MessagesTab" });
                });
              }}
              onDownloadReport={() => {
                void handleOpenUrl(consultation.reportUrl);
              }}
              onReopen={() => {
                void actions.reopen();
              }}
              onArchive={() => {
                void actions.archive();
              }}
              loadingState={actionState}
            />
          </Section>

          {consultation.outcomeSummary ? (
            <Section title="ملخص الحالة">
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 24 }}>
                {consultation.outcomeSummary}
              </Text>
            </Section>
          ) : null}

          <Section title="التسلسل الزمني">
            <ConsultationTimeline events={consultation.timeline} />
          </Section>

          <Section title="الملفات والصور المرفقة">
            {consultation.attachments.length ? (
              <ConsultationAttachmentList attachments={consultation.attachments} onOpen={handleOpenAttachment} />
            ) : (
              <EmptySectionText text="لا توجد ملفات مرفقة في هذه الاستشارة." />
            )}
          </Section>

          <Section title="الرسائل والردود">
            {consultation.messages.length ? (
              <ConsultationMessagesPreview messages={consultation.messages} />
            ) : (
              <EmptySectionText text="لم تبدأ الرسائل بعد." />
            )}
          </Section>

          {consultation.status === "completed" ? (
            <Section title="تقييم الطبيب">
              <ConsultationRatingCard
                rating={consultation.rating}
                selectedScore={selectedScore}
                onSelectScore={setSelectedScore}
                loading={actionState.rating}
                onSubmit={() => {
                  if (!selectedScore) {
                    return;
                  }

                  void actions.rate({ score: selectedScore });
                }}
              />
            </Section>
          ) : null}

          {consultation.status === "completed" && consultation.recommendedDoctors.length ? (
            <Section title="الخيارات المقترحة">
              <SimilarDoctorsSection
                doctors={consultation.recommendedDoctors}
                onDoctorPress={(doctorId) => navigation.navigate("DoctorDetails", { doctorId })}
              />
            </Section>
          ) : null}
        </>
      ) : null}
    </ConsultationScreenLayout>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  const palette = useConsultationTheme();

  return (
    <ConsultationSurface>
      <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 18, textAlign: "right" }}>{title}</Text>
      {children}
    </ConsultationSurface>
  );
}

function EmptySectionText({ text }: { text: string }) {
  const palette = useConsultationTheme();

  return (
    <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 22 }}>
      {text}
    </Text>
  );
}

function MetaPill({ label }: { label: string }) {
  const palette = useConsultationTheme();

  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: palette.surfaceMuted,
        borderWidth: 1,
        borderColor: palette.border
      }}
    >
      <Text style={{ color: palette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{label}</Text>
    </View>
  );
}
