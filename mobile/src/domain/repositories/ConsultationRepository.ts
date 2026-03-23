import {
  ConsultationEntity,
  ConsultationListParams,
  ConsultationRatingPayload,
  CreateConsultationPayload
} from "@/domain/entities/Consultation";

export interface IConsultationRepository {
  listMy(params?: ConsultationListParams): Promise<ConsultationEntity[]>;
  getById(id: string): Promise<ConsultationEntity>;
  create(payload: CreateConsultationPayload): Promise<ConsultationEntity>;
  markAsPaid(id: string): Promise<ConsultationEntity>;
  archive(id: string): Promise<ConsultationEntity>;
  reopen(id: string): Promise<ConsultationEntity>;
  rate(id: string, payload: ConsultationRatingPayload): Promise<ConsultationEntity>;
}
