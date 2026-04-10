import api from "../../api/axios";

export function listDoctors(params = {}) {
  return api.get("/doctors", { params });
}

export function getRecommendedDoctors(params = {}) {
  return api.get("/doctors/recommended", { params });
}

export function getDoctorFilters() {
  return api.get("/doctors/filters");
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

export function setDoctorDailySchedule(payload) {
  return api.post("/doctors/schedule", payload);
}

export function getDoctorDailyAvailability(doctorId, date) {
  return api.get(`/doctors/${doctorId}/daily-schedule`, { params: { date } });
}

