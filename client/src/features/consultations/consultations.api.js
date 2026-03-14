import api from "../../api/axios";

export function createConsultation(payload) {
  return api.post("/consultations", payload);
}

export function listMyConsultations(params = {}) {
  return api.get("/consultations/my", { params });
}

export function listAssignedConsultations(params = {}) {
  return api.get("/consultations/assigned", { params });
}

export function respondConsultation(id, payload) {
  return api.patch(`/consultations/${id}/respond`, payload);
}

export function updateConsultationStatus(id, payload) {
  return api.patch(`/consultations/${id}/status`, payload);
}
