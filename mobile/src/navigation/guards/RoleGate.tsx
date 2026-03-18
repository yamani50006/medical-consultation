import { ReactNode } from "react";

import { UserRole } from "@/core/enums/user-role";
import { useAuthStore } from "@/store/auth/auth.store";

type Props = {
  allow: UserRole[];
  fallback: ReactNode;
  children: ReactNode;
};

export function RoleGate({ allow, fallback, children }: Props) {
  const role = useAuthStore((state) => state.user?.role);
  return role && allow.includes(role) ? <>{children}</> : <>{fallback}</>;
}

