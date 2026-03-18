import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";

export function usePatientProfileQuery() {
  return useQuery({
    queryKey: appQueryKeys.patientProfile(),
    queryFn: () => appContainer.useCases.getMyProfile.execute()
  });
}
