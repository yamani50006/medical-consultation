import { IDoctorRepository, UpdateDoctorProfilePayload } from "@/domain/repositories/DoctorRepository";

export class UpdateMyDoctorProfileUseCase {
  constructor(private readonly repository: IDoctorRepository) {}

  execute(payload: UpdateDoctorProfilePayload) {
    return this.repository.updateMyProfile(payload);
  }
}
