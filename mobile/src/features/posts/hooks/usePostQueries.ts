import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";

export function usePostsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: appQueryKeys.posts(params),
    queryFn: () => appContainer.useCases.listPosts.execute(params)
  });
}
