import { IPatientRepository } from "@/domain/repositories/PatientRepository";

export class GetMyProfileUseCase {
  constructor(private readonly repository: IPatientRepository) {}

  execute() {
    return this.repository.getMyProfile();
  }
}

