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

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await getMe();
        setUser(response.data.data);
        setStoredUser(response.data.data);
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
    setStoredUser(result.user);
    setTokenState(result.token);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    clearToken();
    clearStoredUser();
    setTokenState(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      logout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
