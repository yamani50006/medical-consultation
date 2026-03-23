import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo } from "react";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { ConsultationListParams } from "@/domain/entities/Consultation";
import { useConsultationFilters } from "@/features/consultations/hooks/useConsultationFilters";
import {
  getConsultationAlerts,
  getConsultationFilterCounts,
  getConsultationStatusCounts,
  getConsultationSummary,
  matchesConsultationFilter
} from "@/features/consultations/utils/consultation-helpers";

export function useConsultations(params?: ConsultationListParams) {
  const filters = useConsultationFilters();
  const query = useQuery({
    queryKey: appQueryKeys.consultations(params as Record<string, unknown> | undefined),
    queryFn: () => appContainer.useCases.listConsultations.execute(params)
  });

  const consultations = useDeferredValue(query.data ?? []);

  const filterScopedConsultations = useMemo(
    () =>
      consultations.filter((consultation) =>
        matchesConsultationFilter(consultation, filters.activeFilter, "all")
      ),
    [consultations, filters.activeFilter]
  );

  const filteredConsultations = useMemo(
    () =>
      consultations.filter((consultation) =>
        matchesConsultationFilter(consultation, filters.activeFilter, filters.selectedStatus)
      ),
    [consultations, filters.activeFilter, filters.selectedStatus]
  );

  const filterCounts = useMemo(() => getConsultationFilterCounts(consultations), [consultations]);
  const statusCounts = useMemo(
    () => getConsultationStatusCounts(filterScopedConsultations),
    [filterScopedConsultations]
  );
  const alerts = useMemo(() => getConsultationAlerts(consultations).slice(0, 3), [consultations]);
  const summary = useMemo(() => getConsultationSummary(consultations), [consultations]);

  return {
    ...filters,
    ...query,
    consultations,
    filterScopedConsultations,
    filteredConsultations,
    filterCounts,
    statusCounts,
    alerts,
    summary,
    isRefreshing: query.isFetching && !query.isLoading
  };
}
