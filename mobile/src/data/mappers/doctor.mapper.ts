import { DoctorDto } from "@/data/dtos/doctor.dto";
import { DoctorEntity } from "@/domain/entities/Doctor";

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
    profileImageUrl: dto.profileImageUrl ?? dto.user?.profileImageUrl
  };
};
