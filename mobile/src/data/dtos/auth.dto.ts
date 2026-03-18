export type UserDto = {
  id: string;
  fullName: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  status: string;
  profileImageUrl?: string | null;
};

export type AuthSessionDto = {
  token: string;
  user: UserDto;
};

