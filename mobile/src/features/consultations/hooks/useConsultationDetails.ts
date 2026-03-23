import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { ConsultationRatingPayload } from "@/domain/entities/Consultation";
import {
  useArchiveConsultationMutation,
  useMarkConsultationAsPaidMutation,
  useRateConsultationMutation,
  useReopenConsultationMutation
} from "@/features/consultations/hooks/useConsultationMutations";

export function useConsultationDetails(consultationId: string) {
  const query = useQuery({
    queryKey: appQueryKeys.consultationDetails(consultationId),
    queryFn: () => appContainer.useCases.getConsultationDetails.execute(consultationId),
    enabled: Boolean(consultationId)
  });

  const payMutation = useMarkConsultationAsPaidMutation(consultationId);
  const archiveMutation = useArchiveConsultationMutation(consultationId);
  const reopenMutation = useReopenConsultationMutation(consultationId);
  const rateMutation = useRateConsultationMutation(consultationId);

  return {
    ...query,
    consultation: query.data,
    actions: {
      payNow: () => payMutation.mutateAsync(),
      archive: () => archiveMutation.mutateAsync(),
      reopen: () => reopenMutation.mutateAsync(),
      rate: (payload: ConsultationRatingPayload) => rateMutation.mutateAsync(payload)
    },
    actionState: {
      paying: payMutation.isPending,
      archiving: archiveMutation.isPending,
      reopening: reopenMutation.isPending,
      rating: rateMutation.isPending
    }
  };
}
