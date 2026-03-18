import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";

export function useDoctorsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: appQueryKeys.doctors(params),
    queryFn: () => appContainer.useCases.listDoctors.execute(params)
  });
}

export function useDoctorDetailsQuery(id: string) {
  return useQuery({
    queryKey: appQueryKeys.doctorDetails(id),
    queryFn: () => appContainer.useCases.getDoctorDetails.execute(id),
    enabled: Boolean(id)
  });
}
