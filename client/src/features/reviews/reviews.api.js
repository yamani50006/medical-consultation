import api from "../../api/axios";

export function createReview(payload) {
  return api.post("/reviews", payload);
}

export function listEligibleReviewTargets() {
  return api.get("/reviews/eligible");
}

export function listMyReviews(params = {}) {
  return api.get("/reviews/my", { params });
}

export function listDoctorReviews(params = {}) {
  return api.get("/reviews/doctor", { params });
}

export function listPublicDoctorReviews(doctorId, params = {}) {
  return api.get(`/reviews/public/doctor/${doctorId}`, { params });
}
