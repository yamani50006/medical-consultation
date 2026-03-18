import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";

export function useAppointmentsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: appQueryKeys.appointments(params),
    queryFn: () => appContainer.useCases.listAppointments.execute(params)
  });
}
