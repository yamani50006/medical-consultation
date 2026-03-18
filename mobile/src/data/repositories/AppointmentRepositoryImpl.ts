import { AppointmentService } from "@/data/datasources/AppointmentRemoteDataSource";
import { mapAppointmentDtoToEntity } from "@/data/mappers/appointment.mapper";
import { IAppointmentRepository } from "@/domain/repositories/AppointmentRepository";

export class AppointmentRepositoryImpl implements IAppointmentRepository {
  constructor(private readonly service = new AppointmentService()) {}

  async book(payload: { doctorId: string; appointmentDate: string; notes?: string }) {
    const response = await this.service.book(payload);
    return mapAppointmentDtoToEntity(response.data.data);
  }

  async listMy(params?: Record<string, unknown>) {
    const response = await this.service.listMy(params);
    return response.data.data.map(mapAppointmentDtoToEntity);
  }
}
