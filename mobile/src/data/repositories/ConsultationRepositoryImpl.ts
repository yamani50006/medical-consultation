import { ConsultationService } from "@/data/datasources/ConsultationRemoteDataSource";
import { mapConsultationDtoToEntity } from "@/data/mappers/consultation.mapper";
import {
  ConsultationListParams,
  ConsultationRatingPayload,
  CreateConsultationPayload
} from "@/domain/entities/Consultation";
import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class ConsultationRepositoryImpl implements IConsultationRepository {
  constructor(private readonly service = new ConsultationService()) {}

  async listMy(params?: ConsultationListParams) {
    const response = await this.service.listMy(params);
    const items = response.data.data;

    return items.map(mapConsultationDtoToEntity);
  }

  async getById(id: string) {
    const response = await this.service.getById(id);
    const item = response.data.data;

    return mapConsultationDtoToEntity(item);
  }

  async create(payload: CreateConsultationPayload) {
    const response = await this.service.create(payload);
    const item = response.data.data.consultation;

    return mapConsultationDtoToEntity(item);
  }

  async markAsPaid(id: string) {
    const response = await this.service.markAsPaid(id);
    const item = response.data.data;

    return mapConsultationDtoToEntity(item);
  }

  async archive(id: string) {
    const response = await this.service.archive(id);
    const item = response.data.data;

    return mapConsultationDtoToEntity(item);
  }

  async reopen(id: string) {
    const response = await this.service.reopen(id);
    const item = response.data.data;

    return mapConsultationDtoToEntity(item);
  }

  async rate(id: string, payload: ConsultationRatingPayload) {
    await this.service.rate(id, payload);
    const response = await this.service.getById(id);
    const item = response.data.data;

    return mapConsultationDtoToEntity(item);
  }
}
