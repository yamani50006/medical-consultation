import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";

export function useConversationsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: appQueryKeys.conversations(params),
    queryFn: () => appContainer.useCases.listConversations.execute(params)
  });
}
