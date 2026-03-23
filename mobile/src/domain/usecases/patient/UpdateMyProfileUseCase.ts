import { IPatientRepository, UpdatePatientProfilePayload } from "@/domain/repositories/PatientRepository";

export class UpdateMyProfileUseCase {
  constructor(private readonly repository: IPatientRepository) {}

  execute(payload: UpdatePatientProfilePayload) {
    return this.repository.updateMyProfile(payload);
  }
}
