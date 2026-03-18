import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { AppointmentDto } from "@/data/dtos/appointment.dto";

export class AppointmentService extends BaseApiService {
  constructor() {
    super(api);
  }

  book(payload: { doctorId: string; appointmentDate: string; notes?: string }) {
    return this.post<ApiResponse<AppointmentDto>>("/appointments", payload);
  }

  listMy(params?: Record<string, unknown>) {
    return this.get<ApiResponse<AppointmentDto[]>>("/appointments/my", { params });
  }
}
