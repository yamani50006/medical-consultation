import axios from "axios";
import { clearStoredUser, clearToken, getToken } from "../utils/token";

const defaultBaseUrl = import.meta.env.PROD
  ? "https://medical-consultation-khaki.vercel.app/api/v1"
  : "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseUrl,
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
