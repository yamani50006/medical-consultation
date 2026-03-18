import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";

export function useNotificationsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: appQueryKeys.notifications(params),
    queryFn: () => appContainer.useCases.listNotifications.execute(params)
  });
}
