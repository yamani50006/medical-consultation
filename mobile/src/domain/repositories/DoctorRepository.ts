import {
  DoctorAppointmentSlotEntity,
  DoctorAvailabilitySlotEntity,
  DoctorConsultationMode,
  DoctorEntity,
  DoctorSearchFiltersEntity,
  DoctorSortBy
} from "@/domain/entities/Doctor";

export type ListDoctorsParams = {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  city?: string;
  region?: string;
  consultationMode?: DoctorConsultationMode;
  availableNow?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: DoctorSortBy;
};

export type UpdateDoctorProfilePayload = {
  availabilitySlots?: DoctorAvailabilitySlotEntity[];
  isAvailableNow?: boolean;
};

export interface IDoctorRepository {
  list(params?: ListDoctorsParams): Promise<DoctorEntity[]>;
  listRecommended(params?: Record<string, unknown>): Promise<DoctorEntity[]>;
  getFilters(): Promise<DoctorSearchFiltersEntity>;
  getById(id: string): Promise<DoctorEntity>;
  getMyProfile(): Promise<DoctorEntity>;
  updateMyProfile(payload: UpdateDoctorProfilePayload): Promise<DoctorEntity>;
  getAppointmentSlots(id: string, params?: { days?: number }): Promise<DoctorAppointmentSlotEntity[]>;
}
