import { useMutation } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { queryClient } from "@/shared/utils/query-client";
import { useUiStore } from "@/store/ui/ui.store";

export function useUpdateMyDoctorProfileMutation() {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: { availabilitySlots: { weekday: number; time: string }[] }) =>
      appContainer.useCases.updateMyDoctorProfile.execute(payload),
    onSuccess: async (_, payload) => {
      await queryClient.invalidateQueries({ queryKey: appQueryKeys.myDoctorProfile() });
      await queryClient.invalidateQueries({ queryKey: ["doctor"] });
      await queryClient.invalidateQueries({ queryKey: ["doctor-appointment-slots"] });
      showToast({ title: "تم حفظ المواعيد", description: `تم تحديث ${payload.availabilitySlots.length} موعد متاح للطبيب.` });
    }
  });
}
