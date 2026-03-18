import { IAppointmentRepository } from "@/domain/repositories/AppointmentRepository";

export class BookAppointmentUseCase {
  constructor(private readonly repository: IAppointmentRepository) {}

  execute(payload: { doctorId: string; appointmentDate: string; notes?: string }) {
    return this.repository.book(payload);
  }
}

