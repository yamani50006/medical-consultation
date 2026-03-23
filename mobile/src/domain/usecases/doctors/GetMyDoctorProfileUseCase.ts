import { IDoctorRepository } from "@/domain/repositories/DoctorRepository";

export class GetMyDoctorProfileUseCase {
  constructor(private readonly repository: IDoctorRepository) {}

  execute() {
    return this.repository.getMyProfile();
  }
}
