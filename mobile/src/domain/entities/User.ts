import { UserRole } from "@/core/enums/user-role";

export type UserEntity = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  profileImageUrl?: string | null;
};

