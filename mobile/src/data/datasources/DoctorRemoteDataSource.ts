import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { DoctorDto } from "@/data/dtos/doctor.dto";

export class DoctorService extends BaseApiService {
  constructor() {
    super(api);
  }

  list(params?: Record<string, unknown>) {
    return this.get<ApiResponse<DoctorDto[]>>("/doctors", { params });
  }

  listRecommended(params?: Record<string, unknown>) {
    return this.get<ApiResponse<DoctorDto[]>>("/doctors/recommended", { params });
  }

  getById(id: string) {
    return this.get<ApiResponse<DoctorDto>>(`/doctors/${id}`);
  }
}

