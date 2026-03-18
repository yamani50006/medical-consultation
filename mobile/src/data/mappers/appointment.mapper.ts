import { AppointmentDto } from "@/data/dtos/appointment.dto";
import { AppointmentEntity } from "@/domain/entities/Appointment";

export const mapAppointmentDtoToEntity = (dto: AppointmentDto): AppointmentEntity => ({
  id: dto.id,
  doctorId: dto.doctorId,
  patientId: dto.patientId,
  appointmentDate: dto.appointmentDate,
  notes: dto.notes,
  status: dto.status,
  doctorName: dto.doctor?.user?.fullName,
  doctorEmail: dto.doctor?.user?.email
});
