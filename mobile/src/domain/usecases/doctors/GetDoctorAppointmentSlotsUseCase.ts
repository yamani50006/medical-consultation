import { IDoctorRepository } from "@/domain/repositories/DoctorRepository";

export class GetDoctorAppointmentSlotsUseCase {
  constructor(private readonly repository: IDoctorRepository) {}

  execute(id: string, params?: Record<string, unknown>) {
    return this.repository.getAppointmentSlots(id, params);
  }
}
