import {
  CONSULTATION_MODE,
  DOCTOR_RECOMMENDATION_WEIGHTS,
  DOCTOR_SORT_BY
} from "./recommendation.constants.js";

function normalizeText(value = "") {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function isTextMatch(left, right) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  return normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft);
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export default class DoctorScoringEngine {
  constructor(weights = DOCTOR_RECOMMENDATION_WEIGHTS) {
    this.weights = weights;
  }

  scoreDoctor(doctor, context) {
    const breakdown = this.buildBreakdown(doctor, context);
    const applicableBreakdown = breakdown.filter((item) => item.applicable);
    const totalApplicableWeight = applicableBreakdown.reduce(
      (accumulator, item) => accumulator + item.weight,
      0
    );

    const weightedValue = applicableBreakdown.reduce(
      (accumulator, item) => accumulator + item.weight * item.value,
      0
    );

    const totalScore = totalApplicableWeight
      ? Number(((weightedValue / totalApplicableWeight) * 100).toFixed(1))
      : 0;

    return {
      totalScore,
      reasons: this.buildReasons(doctor, context, breakdown),
      breakdown,
      locationScore: this.getLocationScore(breakdown),
      modeCompatibilityScore: this.getModeScore(breakdown)
    };
  }

  compareBySortOrder(left, right, sortBy = DOCTOR_SORT_BY.BEST_MATCH) {
    if (sortBy === DOCTOR_SORT_BY.TOP_RATED) {
      return (
        right.ratingSummary.averageRating - left.ratingSummary.averageRating ||
        right.ratingSummary.totalReviews - left.ratingSummary.totalReviews ||
        right.recommendation.totalScore - left.recommendation.totalScore
      );
    }

    if (sortBy === DOCTOR_SORT_BY.NEAREST) {
      return (
        right.recommendation.locationScore - left.recommendation.locationScore ||
        right.recommendation.totalScore - left.recommendation.totalScore
      );
    }

    if (sortBy === DOCTOR_SORT_BY.MOST_CONSULTATIONS) {
      return (
        right.consultationCount - left.consultationCount ||
        right.recommendation.totalScore - left.recommendation.totalScore
      );
    }

    if (sortBy === DOCTOR_SORT_BY.PRICE_LOW_TO_HIGH) {
      const leftFee = left.consultationFee ?? Number.MAX_SAFE_INTEGER;
      const rightFee = right.consultationFee ?? Number.MAX_SAFE_INTEGER;
      return leftFee - rightFee || right.recommendation.totalScore - left.recommendation.totalScore;
    }

    return (
      right.recommendation.totalScore - left.recommendation.totalScore ||
      right.ratingSummary.averageRating - left.ratingSummary.averageRating ||
      right.consultationCount - left.consultationCount
    );
  }

  buildBreakdown(doctor, context) {
    const maxConsultationCount = Math.max(context.maxConsultationCount || 1, 1);
    const ratingValue = clamp((doctor.ratingSummary.averageRating || 0) / 5);
    const consultationCountValue = clamp((doctor.consultationCount || 0) / maxConsultationCount);
    const sameCity = isTextMatch(doctor.city, context.patientCity);
    const sameRegion = !sameCity && isTextMatch(doctor.region, context.patientRegion);
    const specialtyMatch = context.specialization
      ? this.getSpecialtyScore(doctor.specialization, context.specialization)
      : null;
    const feeScore = this.getFeeScore(doctor.consultationFee, context);
    const consultationMode = context.consultationMode || CONSULTATION_MODE.ANY;

    return [
      {
        key: "specialtyMatch",
        weight: this.weights.specialtyMatch,
        applicable: Boolean(context.specialization),
        value: specialtyMatch || 0
      },
      {
        key: "sameCity",
        weight: this.weights.sameCity,
        applicable: Boolean(context.patientCity),
        value: sameCity ? 1 : 0
      },
      {
        key: "sameRegion",
        weight: this.weights.sameRegion,
        applicable: Boolean(context.patientRegion),
        value: sameRegion ? 1 : 0
      },
      {
        key: "rating",
        weight: this.weights.rating,
        applicable: true,
        value: ratingValue
      },
      {
        key: "consultationCount",
        weight: this.weights.consultationCount,
        applicable: true,
        value: consultationCountValue
      },
      {
        key: "availabilityNow",
        weight: this.weights.availabilityNow,
        applicable: true,
        value: doctor.isAvailableNow ? 1 : 0
      },
      {
        key: "onlineSupport",
        weight: this.weights.onlineSupport,
        applicable: consultationMode === CONSULTATION_MODE.ONLINE,
        value: doctor.supportsOnline ? 1 : 0
      },
      {
        key: "inPersonSupport",
        weight: this.weights.inPersonSupport,
        applicable: consultationMode === CONSULTATION_MODE.IN_PERSON,
        value: doctor.supportsInPerson ? 1 : 0
      },
      {
        key: "affordableFee",
        weight: this.weights.affordableFee,
        applicable: feeScore !== null,
        value: feeScore || 0
      }
    ];
  }

  buildReasons(doctor, context) {
    const reasons = [];

    if (context.specialization && this.getSpecialtyScore(doctor.specialization, context.specialization) >= 0.6) {
      reasons.push("Strong specialty match");
    }

    if (isTextMatch(doctor.city, context.patientCity)) {
      reasons.push("Same city as patient");
    } else if (isTextMatch(doctor.region, context.patientRegion)) {
      reasons.push("Near the patient region");
    }

    if (doctor.ratingSummary.averageRating >= 4) {
      reasons.push("Highly rated by patients");
    }

    if (doctor.consultationCount >= Math.max(context.maxConsultationCount * 0.4, 3)) {
      reasons.push("Experienced with many consultations");
    }

    if (doctor.isAvailableNow) {
      reasons.push("Available right now");
    }

    if (context.consultationMode === CONSULTATION_MODE.ONLINE && doctor.supportsOnline) {
      reasons.push("Supports online consultation");
    }

    if (context.consultationMode === CONSULTATION_MODE.IN_PERSON && doctor.supportsInPerson) {
      reasons.push("Supports in-person consultation");
    }

    if (context.maxPrice && doctor.consultationFee && doctor.consultationFee <= context.maxPrice) {
      reasons.push("Within the requested budget");
    }

    return reasons.slice(0, 4);
  }

  getLocationScore(breakdown) {
    const sameCity = breakdown.find((item) => item.key === "sameCity");
    const sameRegion = breakdown.find((item) => item.key === "sameRegion");

    return Math.max(sameCity?.value || 0, sameRegion?.value ? 0.65 : 0);
  }

  getModeScore(breakdown) {
    const online = breakdown.find((item) => item.key === "onlineSupport");
    const inPerson = breakdown.find((item) => item.key === "inPersonSupport");
    return Math.max(online?.value || 0, inPerson?.value || 0);
  }

  getSpecialtyScore(doctorSpecialization, requestedSpecialization) {
    if (!doctorSpecialization || !requestedSpecialization) {
      return 0;
    }

    if (isTextMatch(doctorSpecialization, requestedSpecialization)) {
      return 1;
    }

    const doctorWords = normalizeText(doctorSpecialization).split(/\s+/);
    const requestedWords = normalizeText(requestedSpecialization).split(/\s+/);
    const sharedWords = doctorWords.filter((word) => requestedWords.includes(word)).length;

    if (!sharedWords) {
      return 0;
    }

    return clamp(sharedWords / Math.max(requestedWords.length, 1));
  }

  getFeeScore(consultationFee, context) {
    if (consultationFee === null || consultationFee === undefined) {
      return null;
    }

    if (context.maxPrice) {
      return clamp(1 - consultationFee / Math.max(context.maxPrice, 1));
    }

    if (context.maxObservedFee) {
      return clamp(1 - consultationFee / Math.max(context.maxObservedFee, 1));
    }

    return null;
  }
}
