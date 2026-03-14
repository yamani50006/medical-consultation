import api from "../../api/axios";

export function registerPatient(payload) {
  return api.post("/auth/register/patient", payload);
}

export function registerDoctor(payload) {
  return api.post("/auth/register/doctor", payload);
}

export function login(payload) {
  return api.post("/auth/login", payload);
}

export function getMe() {
  return api.get("/auth/me");
}
