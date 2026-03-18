import { DoctorService } from "@/data/datasources/DoctorRemoteDataSource";
import { mapDoctorDtoToEntity } from "@/data/mappers/doctor.mapper";
import { IDoctorRepository } from "@/domain/repositories/DoctorRepository";

export class DoctorRepositoryImpl implements IDoctorRepository {
  constructor(private readonly service = new DoctorService()) {}

  async list(params?: Record<string, unknown>) {
    const response = await this.service.list(params);
    return response.data.data.map(mapDoctorDtoToEntity);
  }

  async listRecommended(params?: Record<string, unknown>) {
    const response = await this.service.listRecommended(params);
    return response.data.data.map(mapDoctorDtoToEntity);
  }

  async getById(id: string) {
    const response = await this.service.getById(id);
    return mapDoctorDtoToEntity(response.data.data);
  }
}

