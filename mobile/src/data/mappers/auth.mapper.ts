import { UserRole } from "@/core/enums/user-role";
import { UserDto } from "@/data/dtos/auth.dto";
import { UserEntity } from "@/domain/entities/User";

export const mapUserDtoToEntity = (dto: UserDto): UserEntity => ({
  id: dto.id,
  fullName: dto.fullName,
  email: dto.email,
  role: dto.role as UserRole,
  status: dto.status,
  profileImageUrl: dto.profileImageUrl
});

