import { DoctorAppointmentSlotDto } from "@/data/dtos/doctor.dto";
import { DoctorAppointmentSlotEntity } from "@/domain/entities/Doctor";

export const mapDoctorAppointmentSlotDtoToEntity = (
  dto: DoctorAppointmentSlotDto
): DoctorAppointmentSlotEntity => ({
  appointmentDate: dto.appointmentDate,
  weekday: dto.weekday ?? new Date(dto.appointmentDate).getDay(),
  time:
    dto.time ??
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date(dto.appointmentDate))
});
