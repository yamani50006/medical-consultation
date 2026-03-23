import { useMemo, useState } from "react";

import { useDoctorsQuery } from "@/features/doctors/hooks/useDoctorQueries";
import { usePostsQuery } from "@/features/posts";

export function useHomeFeed() {
  const [search, setSearch] = useState("");
  const doctorsQuery = useDoctorsQuery(search ? { search } : undefined);
  const postsQuery = usePostsQuery({ limit: 4 });

  return useMemo(
    () => ({
      search,
      setSearch,
      doctorsQuery,
      postsQuery,
      featuredDoctors: (doctorsQuery.data ?? []).slice(0, 4),
      featuredPosts: (postsQuery.data ?? []).slice(0, 2)
    }),
    [search, doctorsQuery, postsQuery]
  );
}
