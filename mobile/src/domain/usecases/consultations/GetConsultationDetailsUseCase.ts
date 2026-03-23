import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class GetConsultationDetailsUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(id: string) {
    return this.repository.getById(id);
  }
}
