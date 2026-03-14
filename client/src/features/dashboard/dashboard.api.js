import api from "../../api/axios";

export function getPatientDashboard() {
  return api.get("/dashboard/patient");
}

export function getDoctorDashboard() {
  return api.get("/dashboard/doctor");
}

export function getAdminDashboard() {
  return api.get("/dashboard/admin");
}

export function getAdminAnalytics() {
  return api.get("/dashboard/admin/analytics");
}
