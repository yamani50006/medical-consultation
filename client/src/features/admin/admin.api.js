import api from "../../api/axios";

export function listPendingDoctors(params = {}) {
  return api.get("/admin/doctors/pending", { params });
}

export function listAdminDoctors(params = {}) {
  return api.get("/admin/doctors", { params });
}

export function getAdminDoctorDetails(id) {
  return api.get(`/admin/doctors/${id}`);
}

export function approveDoctor(id) {
  return api.patch(`/admin/doctors/${id}/approve`);
}

export function rejectDoctor(id, payload) {
  return api.patch(`/admin/doctors/${id}/reject`, payload);
}

export function suspendDoctor(id, payload) {
  return api.patch(`/admin/doctors/${id}/suspend`, payload);
}

export function reactivateDoctor(id, payload = {}) {
  return api.patch(`/admin/doctors/${id}/reactivate`, payload);
}

export function softDeleteDoctor(id, payload) {
  return api.delete(`/admin/doctors/${id}`, { data: payload });
}

export function verifyDoctor(id) {
  return api.patch(`/admin/doctors/${id}/verify`);
}

export function updateDoctorBasicInfo(id, payload) {
  return api.patch(`/admin/doctors/${id}/basic-info`, payload);
}

export function sendDoctorWarning(id, payload) {
  return api.post(`/admin/doctors/${id}/warnings`, payload);
}

export function getAdminAnalyticsOverview() {
  return api.get("/admin/analytics/overview");
}

export function getDoctorPerformance(id) {
  return api.get(`/admin/analytics/doctors/${id}`);
}

export function listAdminAlerts(params = {}) {
  return api.get("/admin/alerts", { params });
}

export function updateAdminAlertStatus(id, payload) {
  return api.patch(`/admin/alerts/${id}/status`, payload);
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
