import api from "../../api/axios";

export function bookAppointment(payload) {
  return api.post("/appointments", payload);
}

export function listMyAppointments(params = {}) {
  return api.get("/appointments/my", { params });
}

export function listDoctorAppointments(params = {}) {
  return api.get("/appointments/doctor", { params });
}

export function updateAppointmentStatus(id, payload) {
  return api.patch(`/appointments/${id}/status`, payload);
}
