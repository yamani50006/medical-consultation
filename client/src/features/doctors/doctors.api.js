import api from "../../api/axios";

export function listDoctors(params = {}) {
  return api.get("/doctors", { params });
}

export function getDoctor(id) {
  return api.get(`/doctors/${id}`);
}

export function getMyDoctorProfile() {
  return api.get("/doctors/me/profile");
}

export function updateMyDoctorProfile(payload) {
  return api.patch("/doctors/me/profile", payload);
}
