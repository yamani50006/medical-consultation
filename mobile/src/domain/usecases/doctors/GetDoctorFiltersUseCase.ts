import { IDoctorRepository } from "@/domain/repositories/DoctorRepository";

export class GetDoctorFiltersUseCase {
  constructor(private readonly repository: IDoctorRepository) {}

  execute() {
    return this.repository.getFilters();
  }
}
