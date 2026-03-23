import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class ReopenConsultationUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(id: string) {
    return this.repository.reopen(id);
  }
}
