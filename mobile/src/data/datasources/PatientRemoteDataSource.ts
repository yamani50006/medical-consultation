import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { PatientProfileDto } from "@/data/dtos/patient.dto";

export class PatientService extends BaseApiService {
  constructor() {
    super(api);
  }

  getMyProfile() {
    return this.get<ApiResponse<PatientProfileDto>>("/patients/me/profile");
  }
}

