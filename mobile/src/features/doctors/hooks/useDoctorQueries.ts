import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { appContainer } from "@/app/di/container";
import { appQueryKeys } from "@/app/di/query-keys";
import { ListDoctorsParams } from "@/domain/repositories/DoctorRepository";

const doctorFiltersQueryKey =
  typeof appQueryKeys.doctorFilters === "function" ? appQueryKeys.doctorFilters() : (["doctor-filters"] as const);

export function useDoctorsQuery(params?: ListDoctorsParams) {
  return useQuery({
    queryKey: appQueryKeys.doctors(params),
    queryFn: () => appContainer.useCases.listDoctors.execute(params)
  });
}

export function useDoctorFiltersQuery() {
  return useQuery({
    queryKey: doctorFiltersQueryKey,
    queryFn: () => appContainer.useCases.getDoctorFilters.execute(),
    staleTime: 1000 * 60 * 10
  });
}

export function useDoctorDetailsQuery(id: string) {
  return useQuery({
    queryKey: appQueryKeys.doctorDetails(id),
    queryFn: () => appContainer.useCases.getDoctorDetails.execute(id),
    enabled: Boolean(id)
  });
}

export function useDoctorAppointmentSlotsQuery(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: appQueryKeys.doctorAppointmentSlots(id, params),
    queryFn: async () => {
      try {
        return await appContainer.useCases.getDoctorAppointmentSlots.execute(id, params);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return [];
        }

        throw error;
      }
    },
    enabled: Boolean(id)
  });
}

export function useMyDoctorProfileQuery() {
  return useQuery({
    queryKey: appQueryKeys.myDoctorProfile(),
    queryFn: () => appContainer.useCases.getMyDoctorProfile.execute()
  });
}
