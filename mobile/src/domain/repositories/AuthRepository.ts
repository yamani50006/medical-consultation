import { UserEntity } from "@/domain/entities/User";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPatientPayload = {
  fullName: string;
  email: string;
  password: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  city?: string;
  region?: string;
};

export type RegisterDoctorPayload = {
  fullName: string;
  email: string;
  password: string;
  specialization: string;
  city?: string;
  region?: string;
  yearsOfExperience: number;
  bio: string;
  licenseNumber: string;
  consultationFee?: number;
  supportsOnline: boolean;
  supportsInPerson: boolean;
};

export interface IAuthRepository {
  login(payload: LoginPayload): Promise<{ token: string; user: UserEntity }>;
  registerPatient(payload: RegisterPatientPayload): Promise<{ token: string; user: UserEntity }>;
  registerDoctor(payload: RegisterDoctorPayload): Promise<{ user: UserEntity }>;
  getMe(): Promise<UserEntity>;
}

