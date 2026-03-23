import { CreateConsultationPayload } from "@/domain/entities/Consultation";
import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class CreateConsultationUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(payload: CreateConsultationPayload) {
    return this.repository.create(payload);
  }
}
