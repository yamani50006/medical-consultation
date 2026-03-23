import { DoctorService } from "@/data/datasources/DoctorRemoteDataSource";
import { mapDoctorAppointmentSlotDtoToEntity } from "@/data/mappers/doctor-appointment-slot.mapper";
import { mapDoctorDtoToEntity, mapDoctorFiltersDtoToEntity } from "@/data/mappers/doctor.mapper";
import { IDoctorRepository, ListDoctorsParams, UpdateDoctorProfilePayload } from "@/domain/repositories/DoctorRepository";

export class DoctorRepositoryImpl implements IDoctorRepository {
  constructor(private readonly service = new DoctorService()) {}

  async list(params?: ListDoctorsParams) {
    const response = await this.service.list(params);
    return response.data.data.map(mapDoctorDtoToEntity);
  }

  async listRecommended(params?: Record<string, unknown>) {
    const response = await this.service.listRecommended(params);
    return response.data.data.map(mapDoctorDtoToEntity);
  }

  async getFilters() {
    const response = await this.service.getFilters();
    return mapDoctorFiltersDtoToEntity(response.data.data);
  }

  async getById(id: string) {
    const response = await this.service.getById(id);
    return mapDoctorDtoToEntity(response.data.data);
  }

  async getMyProfile() {
    const response = await this.service.getMyProfile();
    return mapDoctorDtoToEntity(response.data.data);
  }

  async updateMyProfile(payload: UpdateDoctorProfilePayload) {
    const response = await this.service.updateMyProfile(payload);
    return mapDoctorDtoToEntity(response.data.data);
  }

  async getAppointmentSlots(id: string, params?: { days?: number }) {
    const response = await this.service.getAppointmentSlots(id, params);
    return response.data.data.map(mapDoctorAppointmentSlotDtoToEntity);
  }
}
