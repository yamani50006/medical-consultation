import { useMemo, useState } from "react";

import { useDoctorsQuery } from "@/features/doctors";
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
      postsQuery
    }),
    [search, doctorsQuery, postsQuery]
  );
}
