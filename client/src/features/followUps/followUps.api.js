import api from "../../api/axios";

export function createFollowUp(treatmentPlanId, payload) {
  return api.post(`/follow-ups/treatment-plan/${treatmentPlanId}`, payload);
}

export function listMyFollowUps(params = {}) {
  return api.get("/follow-ups/my", { params });
}

export function listDoctorFollowUps(params = {}) {
  return api.get("/follow-ups/doctor", { params });
}

export function addFollowUpDoctorNote(id, payload) {
  return api.patch(`/follow-ups/${id}/note`, payload);
}
