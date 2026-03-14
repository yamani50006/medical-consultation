import api from "../../api/axios";

export function getMyPatientProfile() {
  return api.get("/patients/me/profile");
}

export function updateMyPatientProfile(payload) {
  return api.patch("/patients/me/profile", payload);
}
