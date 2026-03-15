import api from "../../api/axios";

export function analyzeSymptoms(payload) {
  return api.post("/symptoms/analyze", payload);
}
