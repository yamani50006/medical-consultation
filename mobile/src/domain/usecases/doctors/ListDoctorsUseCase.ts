import { IDoctorRepository } from "@/domain/repositories/DoctorRepository";

export class ListDoctorsUseCase {
  constructor(private readonly repository: IDoctorRepository) {}

  execute(params?: Record<string, unknown>) {
    return this.repository.list(params);
  }
}

