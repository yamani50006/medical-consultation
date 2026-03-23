import { PatientProfileEntity } from "@/domain/entities/PatientProfile";

export type UpdatePatientProfilePayload = {
  fullName?: string;
  profileImageUrl?: string | null;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  city?: string | null;
  region?: string | null;
  bloodType?: string | null;
  chronicDiseases?: string | null;
  currentMedications?: string | null;
};

export interface IPatientRepository {
  getMyProfile(): Promise<PatientProfileEntity>;
  updateMyProfile(payload: UpdatePatientProfilePayload): Promise<PatientProfileEntity>;
}
