import { ConsultationListParams } from "@/domain/entities/Consultation";
import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class ListMyConsultationsUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(params?: ConsultationListParams) {
    return this.repository.listMy(params);
  }
}
