import { PatientProfileEntity } from "@/domain/entities/PatientProfile";

export interface IPatientRepository {
  getMyProfile(): Promise<PatientProfileEntity>;
}

