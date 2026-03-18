import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { UnauthorizedError } from "@/core/errors/UnauthorizedError";
import { env } from "@/app/config/env";
import { sessionManager } from "@/store/auth/session.manager";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 20000
});

api.interceptors.request.use(async (config) => {
  const token = sessionManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await sessionManager.tryRefresh();

      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${refreshed}`;
        return api(originalRequest);
      }

      await sessionManager.clear();
      throw new UnauthorizedError();
    }

    throw error;
  }
);

export { api };

