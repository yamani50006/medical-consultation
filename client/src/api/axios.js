import axios from "axios";
import { clearStoredUser, clearToken, getToken } from "../utils/token";

const defaultBaseUrl = import.meta.env.PROD
  ? "https://medical-consultation-f4ao.onrender.com/api/v1"
  : "http://localhost:5000/api/v1";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      clearStoredUser();
    }
    return Promise.reject(error);
  }
);

export default api;
