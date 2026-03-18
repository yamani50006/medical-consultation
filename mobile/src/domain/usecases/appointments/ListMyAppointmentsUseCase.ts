import { IAppointmentRepository } from "@/domain/repositories/AppointmentRepository";

export class ListMyAppointmentsUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  execute(params?: Record<string, unknown>) {
    return this.repository.listMy(params);
  }
}

