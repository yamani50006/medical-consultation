import { AppointmentEntity } from "@/domain/entities/Appointment";

export interface IAppointmentRepository {
  book(payload: { doctorId: string; appointmentDate: string; notes?: string }): Promise<AppointmentEntity>;
  listMy(params?: Record<string, unknown>): Promise<AppointmentEntity[]>;
}
