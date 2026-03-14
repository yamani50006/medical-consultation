import api from "../../api/axios";

export function getMyMedicalRecord() {
  return api.get("/medical-records/me");
}

export function updateMyMedicalRecord(payload) {
  return api.put("/medical-records/me", payload);
}

export function getPatientMedicalRecord(patientId) {
  return api.get(`/medical-records/patient/${patientId}`);
}
