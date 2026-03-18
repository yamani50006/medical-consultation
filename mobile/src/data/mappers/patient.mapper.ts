import { mapUserDtoToEntity } from "@/data/mappers/auth.mapper";
import { PatientProfileDto } from "@/data/dtos/patient.dto";
import { PatientProfileEntity } from "@/domain/entities/PatientProfile";

export const mapPatientProfileDtoToEntity = (dto: PatientProfileDto): PatientProfileEntity => ({
  id: dto.id,
  userId: dto.userId,
  gender: dto.gender,
  dateOfBirth: dto.dateOfBirth,
  city: dto.city,
  region: dto.region,
  bloodType: dto.bloodType,
  chronicDiseases: dto.chronicDiseases,
  currentMedications: dto.currentMedications,
  user: mapUserDtoToEntity(dto.user)
});

