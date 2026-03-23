import { ApiResponse } from "@/core/network/api-types";
import { BaseApiService } from "@/core/network/BaseApiService";
import { api } from "@/core/network/httpClient";
import { ConsultationDto } from "@/data/dtos/consultation.dto";
import {
  ConsultationListParams,
  ConsultationRatingPayload,
  CreateConsultationPayload
} from "@/domain/entities/Consultation";

export class ConsultationService extends BaseApiService {
  constructor() {
    super(api);
  }

  listMy(params?: ConsultationListParams) {
    return this.get<ApiResponse<ConsultationDto[]>>("/consultations/my", { params });
  }

  getById(id: string) {
    return this.get<ApiResponse<ConsultationDto>>(`/consultations/${id}`);
  }

  create(payload: CreateConsultationPayload) {
    return this.post<ApiResponse<{ consultation: ConsultationDto }>>("/consultations/request", {
      doctorId: payload.doctorId,
      subject: payload.subject,
      description: payload.description,
      specialization: payload.specialization,
      symptomsText: payload.description,
      preferredTime: payload.preferredTime,
      requestType: payload.requestType
    });
  }

  markAsPaid(id: string) {
    return this.post<ApiResponse<ConsultationDto>>(`/consultations/${id}/pay`);
  }

  archive(id: string) {
    return this.patch<ApiResponse<ConsultationDto>>(`/consultations/${id}/archive`);
  }

  reopen(id: string) {
    return this.post<ApiResponse<ConsultationDto>>(`/consultations/${id}/reopen`);
  }

  rate(id: string, payload: ConsultationRatingPayload) {
    return this.post<ApiResponse<{ id: string }>>("/reviews", {
      consultationId: id,
      rating: payload.score,
      comment: payload.comment
    });
  }
}
