import BaseService from "../../core/base/BaseService.js";
import { FALLBACK_SPECIALTY, SYMPTOM_SPECIALTY_RULES } from "./symptom-matching.constants.js";

function normalizeText(value = "") {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default class SymptomAnalyzerService extends BaseService {
  analyzeSymptoms(payload = {}) {
    const symptomsText = normalizeText(payload.symptomsText || "");
    const selectedSymptoms = (payload.symptoms || []).map((item) => normalizeText(item)).filter(Boolean);
    const searchableText = [symptomsText, ...selectedSymptoms].filter(Boolean).join(" ");

    const specialties = SYMPTOM_SPECIALTY_RULES.map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        searchableText.includes(normalizeText(keyword))
      );

      return {
        name: rule.specialty,
        score: matchedKeywords.length * rule.score,
        matchedKeywords
      };
    })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score);

    const totalScore = specialties.reduce((accumulator, item) => accumulator + item.score, 0);
    const suggestedSpecialties = specialties.slice(0, 3).map((item) => ({
      ...item,
      confidence: totalScore ? Number(((item.score / totalScore) * 100).toFixed(1)) : 0
    }));

    const primarySpecialty =
      suggestedSpecialties[0] ||
      {
        name: FALLBACK_SPECIALTY,
        score: 1,
        confidence: 100,
        matchedKeywords: []
      };

    return {
      symptomsText: payload.symptomsText || "",
      selectedSymptoms: payload.symptoms || [],
      suggestedSpecialties,
      primarySpecialty,
      note:
        suggestedSpecialties.length > 0
          ? "Suggested specialties were ranked based on matched symptoms."
          : "No direct specialty match was found, so general medicine was suggested."
    };
  }
}
