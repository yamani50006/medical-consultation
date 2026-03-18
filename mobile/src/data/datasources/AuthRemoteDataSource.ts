import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { AuthSessionDto, UserDto } from "@/data/dtos/auth.dto";
import { LoginPayload, RegisterDoctorPayload, RegisterPatientPayload } from "@/domain/repositories/AuthRepository";

export class AuthService extends BaseApiService {
  constructor() {
    super(api);
  }

  login(payload: LoginPayload) {
    return this.post<ApiResponse<AuthSessionDto>>("/auth/login", payload);
  }

  registerPatient(payload: RegisterPatientPayload) {
    return this.post<ApiResponse<AuthSessionDto>>("/auth/register/patient", payload);
  }

  registerDoctor(payload: RegisterDoctorPayload) {
    return this.post<ApiResponse<{ user: UserDto }>>("/auth/register/doctor", payload);
  }

  getMe() {
    return this.get<ApiResponse<UserDto>>("/auth/me");
  }
}

