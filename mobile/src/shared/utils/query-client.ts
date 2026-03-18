import { QueryClient } from "@tanstack/react-query";

import { QUERY_STALE_TIME } from "@/core/constants/app";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      retry: 1
    },
    mutations: {
      retry: 0
    }
  }
});

