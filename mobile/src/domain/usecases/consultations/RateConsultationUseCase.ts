import { ConsultationRatingPayload } from "@/domain/entities/Consultation";
import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class RateConsultationUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(id: string, payload: ConsultationRatingPayload) {
    return this.repository.rate(id, payload);
  }
}
