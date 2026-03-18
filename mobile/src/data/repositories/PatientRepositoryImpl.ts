import { PatientService } from "@/data/datasources/PatientRemoteDataSource";
import { mapPatientProfileDtoToEntity } from "@/data/mappers/patient.mapper";
import { IPatientRepository } from "@/domain/repositories/PatientRepository";

export class PatientRepositoryImpl implements IPatientRepository {
  constructor(private readonly service = new PatientService()) {}

  async getMyProfile() {
    const response = await this.service.getMyProfile();
    return mapPatientProfileDtoToEntity(response.data.data);
  }
}

