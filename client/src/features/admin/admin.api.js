import api from "../../api/axios";

export function listPendingDoctors(params = {}) {
  return api.get("/admin/doctors/pending", { params });
}

export function approveDoctor(id) {
  return api.patch(`/admin/doctors/${id}/approve`);
}

export function rejectDoctor(id) {
  return api.patch(`/admin/doctors/${id}/reject`);
}

export function listUsers(params = {}) {
  return api.get("/admin/users", { params });
}

export function listAllPosts(params = {}) {
  return api.get("/admin/posts", { params });
}

export function listAllConsultations(params = {}) {
  return api.get("/admin/consultations", { params });
}

export function listAllAppointments(params = {}) {
  return api.get("/admin/appointments", { params });
}
