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
};

