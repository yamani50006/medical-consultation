import { useMutation } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import {
  ConsultationEntity,
  ConsultationRatingPayload,
  CreateConsultationPayload
} from "@/domain/entities/Consultation";
import { queryClient } from "@/shared/utils/query-client";
import { useUiStore } from "@/store/ui/ui.store";

function upsertConsultationInList(
  current: ConsultationEntity[] | undefined,
  updatedConsultation: ConsultationEntity,
  mode: "replace" | "prepend" = "replace"
) {
  if (!current) {
    return current;
  }

  if (mode === "prepend") {
    return [updatedConsultation, ...current.filter((consultation) => consultation.id !== updatedConsultation.id)];
  }

  return current.map((consultation) =>
    consultation.id === updatedConsultation.id ? updatedConsultation : consultation
  );
}

function syncConsultationCaches(
  consultation: ConsultationEntity,
  mode: "replace" | "prepend" = "replace"
) {
  queryClient.setQueryData(appQueryKeys.consultationDetails(consultation.id), consultation);
  queryClient.setQueriesData<ConsultationEntity[]>(
    { queryKey: appQueryKeys.consultationsRoot() },
    (current) => upsertConsultationInList(current, consultation, mode)
  );
}

export function useCreateConsultationMutation() {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: CreateConsultationPayload) => appContainer.useCases.createConsultation.execute(payload),
    onSuccess: (consultation) => {
      syncConsultationCaches(consultation, "prepend");
      showToast({
        title: "تم إرسال الطلب",
        description: `سيصلك إشعار عند بدء مراجعة ${consultation.doctorName}`
      });
    }
  });
}

export function useMarkConsultationAsPaidMutation(consultationId: string) {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: () => appContainer.useCases.markConsultationAsPaid.execute(consultationId),
    onSuccess: (consultation) => {
      syncConsultationCaches(consultation);
      void queryClient.invalidateQueries({ queryKey: appQueryKeys.conversationsRoot() });
      showToast({
        title: "تم تأكيد الدفع",
        description: "فُتح الشات وأصبحت الاستشارة جارية الآن."
      });
    }
  });
}

export function useArchiveConsultationMutation(consultationId: string) {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: () => appContainer.useCases.archiveConsultation.execute(consultationId),
    onSuccess: (consultation) => {
      syncConsultationCaches(consultation);
      showToast({
        title: "تمت الأرشفة",
        description: "يمكنك العودة للاستشارة من تبويب المؤرشفة."
      });
    }
  });
}

export function useReopenConsultationMutation(consultationId: string) {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: () => appContainer.useCases.reopenConsultation.execute(consultationId),
    onSuccess: (consultation) => {
      syncConsultationCaches(consultation);
      void queryClient.invalidateQueries({ queryKey: appQueryKeys.conversationsRoot() });
      showToast({
        title: "تمت إعادة الفتح",
        description: "يمكنك المتابعة من نفس ملف الاستشارة دون إنشاء طلب جديد."
      });
    }
  });
}

export function useRateConsultationMutation(consultationId: string) {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: ConsultationRatingPayload) =>
      appContainer.useCases.rateConsultation.execute(consultationId, payload),
    onSuccess: (consultation) => {
      syncConsultationCaches(consultation);
      showToast({
        title: "تم حفظ التقييم",
        description: "شكرًا لمشاركتك تقييم التجربة."
      });
    }
  });
}
