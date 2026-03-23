import { PatientService } from "@/data/datasources/PatientRemoteDataSource";
import { mapPatientProfileDtoToEntity } from "@/data/mappers/patient.mapper";
import { IPatientRepository, UpdatePatientProfilePayload } from "@/domain/repositories/PatientRepository";

export class PatientRepositoryImpl implements IPatientRepository {
  constructor(private readonly service = new PatientService()) {}

  async getMyProfile() {
    const response = await this.service.getMyProfile();
    return mapPatientProfileDtoToEntity(response.data.data);
  }

  async updateMyProfile(payload: UpdatePatientProfilePayload) {
    const response = await this.service.updateMyProfile(payload);
    return mapPatientProfileDtoToEntity(response.data.data);
  }
}
