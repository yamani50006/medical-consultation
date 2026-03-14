import api from "../../api/axios";

export function createTreatmentPlan(payload) {
  return api.post("/treatment-plans", payload);
}

export function listMyTreatmentPlans(params = {}) {
  return api.get("/treatment-plans/my", { params });
}

export function listDoctorTreatmentPlans(params = {}) {
  return api.get("/treatment-plans/doctor", { params });
}

export function getTreatmentPlan(id) {
  return api.get(`/treatment-plans/${id}`);
}

export function updateTreatmentPlan(id, payload) {
  return api.patch(`/treatment-plans/${id}`, payload);
}
