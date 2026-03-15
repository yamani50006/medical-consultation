import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import SymptomAnalyzerService from "../symptoms/symptoms.service.js";
import ReviewsRepository from "../reviews/reviews.repository.js";
import DoctorScoringEngine from "./doctorScoring.engine.js";
import {
  CONSULTATION_MODE,
  DEFAULT_RECOMMENDATION_LIMIT,
  DOCTOR_SORT_BY
} from "./recommendation.constants.js";
import RecommendationsRepository from "./recommendations.repository.js";

function normalizeText(value = "") {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}

export default class DoctorRecommendationService extends BaseService {
  constructor() {
    super();
    this.recommendationsRepository = new RecommendationsRepository();
    this.reviewsRepository = new ReviewsRepository();
    this.symptomAnalyzerService = new SymptomAnalyzerService();
    this.scoringEngine = new DoctorScoringEngine();
  }

  async searchDoctors(query, userId = null) {
    const { page, limit } = this.getPagination(query);
    const recommendationResult = await this.buildRecommendationResult(query, userId);
    const startIndex = (page - 1) * limit;
    const items = recommendationResult.items.slice(startIndex, startIndex + limit);

    return {
      items,
      meta: buildPaginationMeta({
        page,
        limit,
        total: recommendationResult.items.length
      })
    };
  }

  async recommendDoctors(query, userId = null) {
    const recommendationResult = await this.buildRecommendationResult(query, userId);
    const limit = Math.min(
      Number(query.limit || DEFAULT_RECOMMENDATION_LIMIT),
      recommendationResult.items.length || DEFAULT_RECOMMENDATION_LIMIT
    );

    return {
      items: recommendationResult.items.slice(0, limit),
      topDoctors: recommendationResult.items.slice(0, DEFAULT_RECOMMENDATION_LIMIT),
      suggestedSpecialties: recommendationResult.suggestedSpecialties,
      appliedFilters: recommendationResult.appliedFilters,
      totalCandidates: recommendationResult.items.length
    };
  }

  async getFilterOptions() {
    const doctors = await this.recommendationsRepository.findDoctorFilterValues();
    const specializations = [...new Set(doctors.map((item) => item.specialization).filter(Boolean))].sort();
    const cities = [...new Set(doctors.map((item) => item.city).filter(Boolean))].sort();
    const regions = [...new Set(doctors.map((item) => item.region).filter(Boolean))].sort();
    const fees = doctors.map((item) => item.consultationFee).filter((value) => typeof value === "number");

    return {
      specializations,
      cities,
      regions,
      priceRange: fees.length
        ? { min: Math.min(...fees), max: Math.max(...fees) }
        : { min: 0, max: 0 },
      consultationModes: Object.values(CONSULTATION_MODE)
    };
  }

  async buildRecommendationResult(query, userId = null) {
    const patientContext = await this.resolvePatientContext(query, userId);
    const symptomAnalysis = query.symptomsText
      ? this.symptomAnalyzerService.analyzeSymptoms({
          symptomsText: query.symptomsText
        })
      : null;

    const specialization =
      normalizeText(query.specialization || "") ||
      symptomAnalysis?.primarySpecialty?.name ||
      undefined;

    const where = this.buildDoctorWhereClause({
      ...query,
      specialization
    });
    const candidates = await this.recommendationsRepository.findRecommendationCandidates(where);
    const ratingSummaryMap = await this.reviewsRepository.getDoctorRatingSummaryMap(
      candidates.map((item) => item.id)
    );

    const maxConsultationCount = Math.max(...candidates.map((item) => item._count.consultations || 0), 1);
    const maxObservedFee = Math.max(
      ...candidates.map((item) => item.consultationFee || 0),
      0
    );

    const enriched = candidates
      .map((candidate) => ({
        ...candidate,
        consultationCount: candidate._count.consultations || 0,
        ratingSummary: ratingSummaryMap[candidate.id] || {
          averageRating: 0,
          totalReviews: 0
        }
      }))
      .filter((candidate) =>
        query.minRating ? candidate.ratingSummary.averageRating >= Number(query.minRating) : true
      )
      .map((candidate) => ({
        ...candidate,
        recommendation: this.scoringEngine.scoreDoctor(candidate, {
          ...patientContext,
          specialization,
          consultationMode: query.consultationMode || CONSULTATION_MODE.ANY,
          maxPrice: query.maxPrice,
          maxObservedFee,
          maxConsultationCount
        })
      }))
      .sort((left, right) =>
        this.scoringEngine.compareBySortOrder(
          left,
          right,
          query.sortBy || DOCTOR_SORT_BY.BEST_MATCH
        )
      );

    return {
      items: enriched,
      suggestedSpecialties: symptomAnalysis?.suggestedSpecialties || [],
      appliedFilters: compactObject({
        specialization,
        city: query.city,
        region: query.region,
        patientCity: patientContext.patientCity,
        patientRegion: patientContext.patientRegion,
        consultationMode: query.consultationMode || CONSULTATION_MODE.ANY,
        availableNow: query.availableNow,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        minRating: query.minRating,
        sortBy: query.sortBy || DOCTOR_SORT_BY.BEST_MATCH
      })
    };
  }

  async resolvePatientContext(query, userId = null) {
    const patientProfile = userId
      ? await this.recommendationsRepository.findPatientProfileByUserId(userId)
      : null;

    return {
      patientCity: normalizeText(query.patientCity || patientProfile?.city || ""),
      patientRegion: normalizeText(query.patientRegion || patientProfile?.region || "")
    };
  }

  buildDoctorWhereClause(query) {
    const conditions = [
      { approvalStatus: "APPROVED" },
      { user: { status: "ACTIVE" } }
    ];

    if (query.specialization) {
      conditions.push({
        specialization: {
          contains: query.specialization,
          mode: "insensitive"
        }
      });
    }

    if (query.city) {
      conditions.push({
        city: {
          contains: query.city,
          mode: "insensitive"
        }
      });
    }

    if (query.region) {
      conditions.push({
        region: {
          contains: query.region,
          mode: "insensitive"
        }
      });
    }

    if (query.availableNow) {
      conditions.push({
        isAvailableNow: true
      });
    }

    if (query.consultationMode === CONSULTATION_MODE.ONLINE) {
      conditions.push({
        supportsOnline: true
      });
    }

    if (query.consultationMode === CONSULTATION_MODE.IN_PERSON) {
      conditions.push({
        supportsInPerson: true
      });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      conditions.push({
        consultationFee: compactObject({
          gte: query.minPrice,
          lte: query.maxPrice
        })
      });
    }

    if (query.search) {
      conditions.push({
        OR: [
          { specialization: { contains: query.search, mode: "insensitive" } },
          { city: { contains: query.search, mode: "insensitive" } },
          { region: { contains: query.search, mode: "insensitive" } },
          { bio: { contains: query.search, mode: "insensitive" } },
          {
            user: {
              fullName: {
                contains: query.search,
                mode: "insensitive"
              }
            }
          }
        ]
      });
    }

    return { AND: conditions };
  }
}
