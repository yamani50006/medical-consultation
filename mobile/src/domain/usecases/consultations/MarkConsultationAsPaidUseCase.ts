import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class MarkConsultationAsPaidUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(id: string) {
    return this.repository.markAsPaid(id);
  }
}
