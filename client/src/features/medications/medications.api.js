import api from "../../api/axios";

export function listTreatmentPlanMedications(treatmentPlanId) {
  return api.get(`/medications/treatment-plan/${treatmentPlanId}`);
}

export function addMedications(treatmentPlanId, payload) {
  return api.post(`/medications/treatment-plan/${treatmentPlanId}`, payload);
}

export function updateMedication(id, payload) {
  return api.patch(`/medications/${id}`, payload);
}

export function deleteMedication(id) {
  return api.delete(`/medications/${id}`);
}
