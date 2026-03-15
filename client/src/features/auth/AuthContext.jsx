import { createContext, useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest } from "./auth.api";
import {
  clearStoredUser,
  clearToken,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken
} from "../../utils/token";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setTokenState] = useState(getToken());
  const [isLoading, setIsLoading] = useState(Boolean(getToken()));

  const syncUser = (nextUser) => {
    setStoredUser(nextUser);
    setUser(nextUser);
    return nextUser;
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await getMe();
        syncUser(response.data.data);
      } catch (error) {
        clearToken();
        clearStoredUser();
        setTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    const result = response.data.data;
    setToken(result.token);
    setTokenState(result.token);
    syncUser(result.user);
    return result.user;
  };

  const logout = () => {
    clearToken();
    clearStoredUser();
    setTokenState(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await getMe();
    return syncUser(response.data.data);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      refreshUser,
      setCurrentUser: syncUser,
      logout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
