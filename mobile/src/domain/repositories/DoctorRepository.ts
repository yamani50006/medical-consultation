import { DoctorEntity } from "@/domain/entities/Doctor";

export interface IDoctorRepository {
  list(params?: Record<string, unknown>): Promise<DoctorEntity[]>;
  listRecommended(params?: Record<string, unknown>): Promise<DoctorEntity[]>;
  getById(id: string): Promise<DoctorEntity>;
}

