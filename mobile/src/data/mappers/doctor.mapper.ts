import { DoctorDto, DoctorFiltersDto } from "@/data/dtos/doctor.dto";
import { DoctorEntity, DoctorSearchFiltersEntity } from "@/domain/entities/Doctor";

export const mapDoctorDtoToEntity = (dto: DoctorDto): DoctorEntity => {
  const profile = dto.doctorProfile;

  return {
    id: dto.id,
    fullName: dto.fullName ?? dto.user?.fullName ?? "طبيب",
    specialization: dto.specialization ?? profile?.specialization ?? "طبيب عام",
    city: dto.city ?? profile?.city,
    region: dto.region ?? profile?.region,
    bio: dto.bio ?? profile?.bio,
    consultationFee: dto.consultationFee ?? profile?.consultationFee,
    yearsOfExperience: dto.yearsOfExperience ?? profile?.yearsOfExperience ?? 0,
    rating: dto.averageRating ?? dto.ratingSummary?.averageRating ?? 0,
    reviewsCount: dto.reviewsCount ?? dto.ratingSummary?.totalReviews ?? 0,
    isAvailableNow: dto.isAvailableNow ?? profile?.isAvailableNow ?? false,
    supportsOnline: dto.supportsOnline ?? profile?.supportsOnline ?? true,
    supportsInPerson: dto.supportsInPerson ?? profile?.supportsInPerson ?? true,
    profileImageUrl: dto.profileImageUrl ?? dto.user?.profileImageUrl,
    recommendation: dto.recommendation
      ? {
          totalScore: dto.recommendation.totalScore ?? 0,
          reasons: (dto.recommendation.reasons ?? []).filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        }
      : null,
    availabilitySlots: (dto.availabilitySlots ?? [])
      .filter((slot) => typeof slot.weekday === "number" && typeof slot.time === "string")
      .map((slot) => ({
        weekday: slot.weekday as number,
        time: slot.time as string
      }))
  };
};

export const mapDoctorFiltersDtoToEntity = (dto: DoctorFiltersDto): DoctorSearchFiltersEntity => ({
  specializations: (dto.specializations ?? []).filter((item): item is string => typeof item === "string" && item.trim().length > 0),
  cities: (dto.cities ?? []).filter((item): item is string => typeof item === "string" && item.trim().length > 0),
  regions: (dto.regions ?? []).filter((item): item is string => typeof item === "string" && item.trim().length > 0),
  consultationModes: (dto.consultationModes ?? []).filter(
    (item): item is "any" | "online" | "in_person" => item === "any" || item === "online" || item === "in_person"
  ),
  priceRange: {
    min: dto.priceRange?.min ?? 0,
    max: dto.priceRange?.max ?? 0
  }
});
