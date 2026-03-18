import { IDoctorRepository } from "@/domain/repositories/DoctorRepository";

export class GetDoctorDetailsUseCase {
  constructor(private readonly repository: IDoctorRepository) {}

  execute(id: string) {
    return this.repository.getById(id);
  }
}

