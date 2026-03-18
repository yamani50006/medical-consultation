export type DoctorDto = {
  id: string;
  fullName?: string;
  profileImageUrl?: string | null;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    profileImageUrl?: string | null;
  };
  specialization?: string;
  city?: string | null;
  region?: string | null;
  bio?: string | null;
  consultationFee?: number | null;
  yearsOfExperience?: number;
  isAvailableNow?: boolean;
  supportsOnline?: boolean;
  supportsInPerson?: boolean;
  doctorProfile?: {
    specialization?: string;
    city?: string | null;
    region?: string | null;
    bio?: string | null;
    consultationFee?: number | null;
    yearsOfExperience?: number;
    isAvailableNow?: boolean;
    supportsOnline?: boolean;
    supportsInPerson?: boolean;
  };
  averageRating?: number;
  reviewsCount?: number;
  ratingSummary?: {
    averageRating?: number;
    totalReviews?: number;
  };
};
