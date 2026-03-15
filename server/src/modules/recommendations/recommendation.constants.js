export const CONSULTATION_MODE = Object.freeze({
  ANY: "any",
  ONLINE: "online",
  IN_PERSON: "in_person"
});

export const DOCTOR_SORT_BY = Object.freeze({
  BEST_MATCH: "best_match",
  TOP_RATED: "top_rated",
  NEAREST: "nearest",
  MOST_CONSULTATIONS: "most_consultations",
  PRICE_LOW_TO_HIGH: "price_low_to_high"
});

export const DEFAULT_RECOMMENDATION_LIMIT = 3;

export const DOCTOR_RECOMMENDATION_WEIGHTS = Object.freeze({
  specialtyMatch: 34,
  sameCity: 18,
  sameRegion: 10,
  rating: 16,
  consultationCount: 10,
  availabilityNow: 6,
  onlineSupport: 6,
  inPersonSupport: 6,
  affordableFee: 4
});
