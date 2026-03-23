import { create } from "zustand";

import { UserEntity } from "@/domain/entities/User";

type AuthState = {
  hydrated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: UserEntity | null;
  setSession: (payload: { token: string; refreshToken?: string | null; user: UserEntity }) => void;
  updateUser: (user: UserEntity) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  token: null,
  refreshToken: null,
  user: null,
  setSession: ({ token, refreshToken = null, user }) => set({ token, refreshToken, user }),
  updateUser: (user) => set((state) => ({ ...state, user })),
  clearSession: () => set({ token: null, refreshToken: null, user: null }),
  setHydrated: (hydrated) => set({ hydrated })
}));
