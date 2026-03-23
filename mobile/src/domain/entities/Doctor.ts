export type DoctorConsultationMode = "any" | "online" | "in_person";

export type DoctorSortBy =
  | "best_match"
  | "top_rated"
  | "nearest"
  | "most_consultations"
  | "price_low_to_high";

export type DoctorAvailabilitySlotEntity = {
  weekday: number;
  time: string;
};

export type DoctorAppointmentSlotEntity = {
  appointmentDate: string;
  weekday: number;
  time: string;
};

export type DoctorRecommendationEntity = {
  totalScore: number;
  reasons: string[];
};

export type DoctorSearchFiltersEntity = {
  specializations: string[];
  cities: string[];
  regions: string[];
  consultationModes: DoctorConsultationMode[];
  priceRange: {
    min: number;
    max: number;
  };
};

export type DoctorEntity = {
  id: string;
  fullName: string;
  specialization: string;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  consultationFee?: number | null;
  yearsOfExperience?: number;
  rating: number;
  reviewsCount: number;
  isAvailableNow: boolean;
  supportsOnline: boolean;
  supportsInPerson: boolean;
  profileImageUrl?: string | null;
  availabilitySlots: DoctorAvailabilitySlotEntity[];
  recommendation?: DoctorRecommendationEntity | null;
};
