import { appContainer } from "@/app/di/container";
import { SESSION_STORAGE_KEY } from "@/core/constants/app";
import { secureStorage } from "@/core/storage/secureStorage";
import { UserEntity } from "@/domain/entities/User";
import { useAuthStore } from "@/store/auth/auth.store";

type StoredSession = {
  token: string;
  refreshToken?: string | null;
};

class SessionManager {
  getToken() {
    return useAuthStore.getState().token;
  }

  async persist(payload: { token: string; refreshToken?: string | null }) {
    await secureStorage.setSecureItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }

  async hydrate() {
    const raw = await secureStorage.getSecureItem(SESSION_STORAGE_KEY);
    if (!raw) {
      useAuthStore.getState().setHydrated(true);
      return;
    }

    try {
      const stored = JSON.parse(raw) as StoredSession;
      useAuthStore.getState().setSession({
        token: stored.token,
        refreshToken: stored.refreshToken,
        user: await appContainer.repositories.auth.getMe()
      });
    } catch {
      await this.clear();
    } finally {
      useAuthStore.getState().setHydrated(true);
    }
  }

  async start(payload: { token: string; refreshToken?: string | null; user: UserEntity }) {
    useAuthStore.getState().setSession(payload);
    await this.persist({ token: payload.token, refreshToken: payload.refreshToken });
  }

  async clear() {
    useAuthStore.getState().clearSession();
    await secureStorage.deleteSecureItem(SESSION_STORAGE_KEY);
  }

  async tryRefresh() {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      return null;
    }
    return null;
  }
}

export const sessionManager = new SessionManager();
