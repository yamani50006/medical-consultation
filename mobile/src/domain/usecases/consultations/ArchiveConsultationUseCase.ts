import { IConsultationRepository } from "@/domain/repositories/ConsultationRepository";

export class ArchiveConsultationUseCase {
  constructor(private readonly repository: IConsultationRepository) {}

  execute(id: string) {
    return this.repository.archive(id);
  }
}
