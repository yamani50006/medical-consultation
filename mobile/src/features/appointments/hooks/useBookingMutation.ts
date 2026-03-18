import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { bookingSchema, BookingFormValues } from "@/features/appointments/schemas/booking.schemas";
import { queryClient } from "@/shared/utils/query-client";
import { useUiStore } from "@/store/ui/ui.store";

export function useBookingForm() {
  return useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { appointmentDate: "", notes: "" }
  });
}

export function useBookAppointmentMutation(doctorId: string) {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: BookingFormValues) => appContainer.useCases.bookAppointment.execute({ doctorId, ...payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appQueryKeys.appointmentsRoot() });
      showToast({ title: "تم الحجز بنجاح", description: "سيصلك إشعار بالتأكيد عند اعتماد الموعد" });
    }
  });
}
