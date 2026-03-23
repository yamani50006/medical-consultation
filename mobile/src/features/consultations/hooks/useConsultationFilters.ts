import { startTransition, useMemo } from "react";

import { consultationFilterTabs, consultationStatusMap, consultationStatusOrder } from "@/features/consultations/constants/consultation-status";
import { useConsultationFiltersStore } from "@/features/consultations/store/consultation-filters.store";

export function useConsultationFilters() {
  const activeFilter = useConsultationFiltersStore((state) => state.activeFilter);
  const selectedStatus = useConsultationFiltersStore((state) => state.selectedStatus);
  const setActiveFilterState = useConsultationFiltersStore((state) => state.setActiveFilter);
  const setSelectedStatusState = useConsultationFiltersStore((state) => state.setSelectedStatus);
  const reset = useConsultationFiltersStore((state) => state.reset);

  return useMemo(
    () => ({
      activeFilter,
      selectedStatus,
      filterTabs: consultationFilterTabs,
      statusTabs: consultationStatusOrder.map((status) => ({
        id: status,
        label: consultationStatusMap[status].shortLabel,
        description: consultationStatusMap[status].description
      })),
      setActiveFilter: (nextFilter: typeof activeFilter) =>
        startTransition(() => {
          setActiveFilterState(nextFilter);
          setSelectedStatusState("all");
        }),
      setSelectedStatus: (nextStatus: typeof selectedStatus) =>
        startTransition(() => {
          setSelectedStatusState(nextStatus);
        }),
      reset
    }),
    [activeFilter, reset, selectedStatus, setActiveFilterState, setSelectedStatusState]
  );
}
