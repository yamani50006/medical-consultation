import { UserDto } from "@/data/dtos/auth.dto";

export type PatientProfileDto = {
  id: string;
  userId: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  city?: string | null;
  region?: string | null;
  bloodType?: string | null;
  chronicDiseases?: string | null;
  currentMedications?: string | null;
  user: UserDto;
};

