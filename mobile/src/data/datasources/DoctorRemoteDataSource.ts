import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { DoctorAppointmentSlotDto, DoctorDto, DoctorFiltersDto } from "@/data/dtos/doctor.dto";
import { ListDoctorsParams } from "@/domain/repositories/DoctorRepository";

export class DoctorService extends BaseApiService {
  constructor() {
    super(api);
  }

  list(params?: ListDoctorsParams) {
    return this.get<ApiResponse<DoctorDto[]>>("/doctors", { params });
  }

  listRecommended(params?: Record<string, unknown>) {
    return this.get<ApiResponse<DoctorDto[]>>("/doctors/recommended", { params });
  }

  getFilters() {
    return this.get<ApiResponse<DoctorFiltersDto>>("/doctors/filters");
  }

  getById(id: string) {
    return this.get<ApiResponse<DoctorDto>>(`/doctors/${id}`);
  }

  getMyProfile() {
    return this.get<ApiResponse<DoctorDto>>("/doctors/me/profile");
  }

  updateMyProfile(payload: Record<string, unknown>) {
    return this.patch<ApiResponse<DoctorDto>>("/doctors/me/profile", payload);
  }

  getAppointmentSlots(id: string, params?: { days?: number }) {
    return this.get<ApiResponse<DoctorAppointmentSlotDto[]>>(`/doctors/${id}/appointment-slots`, { params });
  }
}
