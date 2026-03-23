import { useDeferredValue, useMemo, useState } from "react";

import { DoctorConsultationMode, DoctorSearchFiltersEntity, DoctorSortBy } from "@/domain/entities/Doctor";
import { ListDoctorsParams } from "@/domain/repositories/DoctorRepository";
import { useDoctorFiltersQuery, useDoctorsQuery } from "@/features/doctors/hooks/useDoctorQueries";
import { usePatientProfileQuery } from "@/features/profile/hooks/usePatientProfileQuery";

export type DoctorPricePreset = {
  id: "all" | "budget" | "balanced" | "premium";
  label: string;
  minPrice?: number;
  maxPrice?: number;
};

export type DoctorLocationPreference = "all" | "city" | "region";

type SmartDoctorSearchState = {
  search: string;
  setSearch: (value: string) => void;
  selectedSpecialization: string | null;
  setSelectedSpecialization: (value: string | null) => void;
  selectedMode: DoctorConsultationMode;
  setSelectedMode: (value: DoctorConsultationMode) => void;
  availableNowOnly: boolean;
  setAvailableNowOnly: (value: boolean) => void;
  sortPreference: DoctorSortBy | "auto";
  setSortPreference: (value: DoctorSortBy | "auto") => void;
  selectedPricePresetId: DoctorPricePreset["id"];
  setSelectedPricePresetId: (value: DoctorPricePreset["id"]) => void;
  selectedMinimumRating: number | null;
  setSelectedMinimumRating: (value: number | null) => void;
  locationPreference: DoctorLocationPreference;
  setLocationPreference: (value: DoctorLocationPreference) => void;
  pricePresets: DoctorPricePreset[];
  ratingOptions: Array<{ label: string; value: number | null }>;
  locationOptions: Array<{ label: string; value: DoctorLocationPreference }>;
  activeFiltersCount: number;
  effectiveParams: ListDoctorsParams;
  effectiveSummary: string[];
  specializationChips: string[];
  selectedPricePreset: DoctorPricePreset;
  clearFilters: () => void;
  doctorsQuery: ReturnType<typeof useDoctorsQuery>;
  filtersQuery: ReturnType<typeof useDoctorFiltersQuery>;
};

const SORT_KEYWORDS: Array<{ sortBy: DoctorSortBy; keywords: string[] }> = [
  { sortBy: "top_rated", keywords: ["افضل", "الأفضل", "اعلى تقييم", "أعلى تقييم", "ممتاز", "best"] },
  { sortBy: "price_low_to_high", keywords: ["ارخص", "أرخص", "رخيص", "اقتصادي", "اقل سعر", "أقل سعر", "سعر"] },
  { sortBy: "nearest", keywords: ["قريب", "بالقرب", "نفس المدينه", "نفس المدينة", "اقرب", "أقرب"] },
  { sortBy: "most_consultations", keywords: ["خبره", "خبرة", "مشهور", "استشارات كثيره", "استشارات كثيرة"] }
] as const;

const ONLINE_KEYWORDS = ["اونلاين", "أونلاين", "عن بعد", "عن بُعد", "online", "remote"];
const IN_PERSON_KEYWORDS = ["حضوري", "في العياده", "في العيادة", "عياده", "عيادة", "in person"];
const AVAILABLE_NOW_KEYWORDS = ["الان", "الآن", "اليوم", "فوري", "سريع", "متاح"];

export const DOCTOR_SORT_OPTIONS: Array<{ value: DoctorSortBy | "auto"; label: string }> = [
  { value: "auto", label: "ذكي" },
  { value: "best_match", label: "الأقرب لحالتك" },
  { value: "top_rated", label: "الأعلى تقييماً" },
  { value: "price_low_to_high", label: "الأقل سعراً" },
  { value: "nearest", label: "الأقرب" },
  { value: "most_consultations", label: "الأكثر خبرة" }
];

export const DOCTOR_MODE_OPTIONS: Array<{ value: DoctorConsultationMode; label: string }> = [
  { value: "any", label: "الكل" },
  { value: "online", label: "أونلاين" },
  { value: "in_person", label: "حضوري" }
];

const DOCTOR_RATING_OPTIONS: Array<{ label: string; value: number | null }> = [
  { label: "الكل", value: null },
  { label: "+4.5", value: 4.5 },
  { label: "+4.0", value: 4 },
  { label: "+3.5", value: 3.5 }
];

export function useSmartDoctorSearch(): SmartDoctorSearchState {
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<DoctorConsultationMode>("any");
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [sortPreference, setSortPreference] = useState<DoctorSortBy | "auto">("auto");
  const [selectedPricePresetId, setSelectedPricePresetId] = useState<DoctorPricePreset["id"]>("all");
  const [selectedMinimumRating, setSelectedMinimumRating] = useState<number | null>(null);
  const [locationPreference, setLocationPreference] = useState<DoctorLocationPreference>("all");

  const deferredSearch = useDeferredValue(search.trim());
  const filtersQuery = useDoctorFiltersQuery();
  const patientProfileQuery = usePatientProfileQuery();
  const smartInterpretation = useMemo(
    () => interpretDoctorSearchQuery(deferredSearch, filtersQuery.data),
    [deferredSearch, filtersQuery.data]
  );

  const pricePresets = useMemo(
    () => buildPricePresets(filtersQuery.data?.priceRange),
    [filtersQuery.data?.priceRange]
  );

  const selectedPricePreset =
    pricePresets.find((preset) => preset.id === selectedPricePresetId) ?? pricePresets[0];

  const locationOptions = useMemo(
    () => buildLocationOptions(patientProfileQuery.data?.city, patientProfileQuery.data?.region),
    [patientProfileQuery.data?.city, patientProfileQuery.data?.region]
  );

  const effectiveParams = useMemo<ListDoctorsParams>(() => {
    const consultationMode = selectedMode !== "any" ? selectedMode : smartInterpretation.consultationMode;
    const fallbackCity =
      !smartInterpretation.city && locationPreference === "city"
        ? patientProfileQuery.data?.city ?? undefined
        : undefined;
    const fallbackRegion =
      !smartInterpretation.city && !smartInterpretation.region && locationPreference === "region"
        ? patientProfileQuery.data?.region ?? undefined
        : undefined;
    const effectiveSortBy =
      sortPreference === "auto"
        ? locationPreference !== "all"
          ? "nearest"
          : smartInterpretation.sortBy ?? "best_match"
        : sortPreference;

    return {
      search: deferredSearch || undefined,
      specialization: selectedSpecialization ?? smartInterpretation.specialization,
      city: smartInterpretation.city ?? fallbackCity,
      region: smartInterpretation.region ?? fallbackRegion,
      consultationMode: consultationMode && consultationMode !== "any" ? consultationMode : undefined,
      availableNow: availableNowOnly || smartInterpretation.availableNow ? true : undefined,
      minPrice: selectedPricePreset.minPrice,
      maxPrice: selectedPricePreset.maxPrice,
      minRating: selectedMinimumRating ?? undefined,
      sortBy: effectiveSortBy
    };
  }, [
    availableNowOnly,
    deferredSearch,
    locationPreference,
    patientProfileQuery.data?.city,
    patientProfileQuery.data?.region,
    selectedMinimumRating,
    selectedMode,
    selectedPricePreset.maxPrice,
    selectedPricePreset.minPrice,
    selectedSpecialization,
    smartInterpretation.availableNow,
    smartInterpretation.city,
    smartInterpretation.consultationMode,
    smartInterpretation.region,
    smartInterpretation.sortBy,
    smartInterpretation.specialization,
    sortPreference
  ]);

  const doctorsQuery = useDoctorsQuery(effectiveParams);

  const specializationChips = useMemo(
    () => buildSpecializationChips(filtersQuery.data, deferredSearch, doctorsQuery.data ?? [], selectedSpecialization),
    [deferredSearch, doctorsQuery.data, filtersQuery.data, selectedSpecialization]
  );

  const effectiveSummary = useMemo(() => {
    const summary: string[] = [];

    if (selectedSpecialization ?? smartInterpretation.specialization) {
      summary.push(`التخصص: ${selectedSpecialization ?? smartInterpretation.specialization}`);
    }

    if (effectiveParams.city) {
      summary.push(`المدينة: ${effectiveParams.city}`);
    } else if (effectiveParams.region) {
      summary.push(`المنطقة: ${effectiveParams.region}`);
    }

    if (selectedMode === "online" || smartInterpretation.consultationMode === "online") {
      summary.push("أونلاين");
    }

    if (selectedMode === "in_person" || smartInterpretation.consultationMode === "in_person") {
      summary.push("حضوري");
    }

    if (availableNowOnly || smartInterpretation.availableNow) {
      summary.push("متاح الآن");
    }

    if (selectedPricePreset.id !== "all") {
      summary.push(`السعر: ${selectedPricePreset.label}`);
    }

    if (selectedMinimumRating) {
      summary.push(`التقييم: +${selectedMinimumRating.toFixed(1)}`);
    }

    summary.push(
      `الترتيب: ${getSortLabel(
        sortPreference === "auto" ? effectiveParams.sortBy ?? "best_match" : sortPreference
      )}`
    );

    return summary;
  }, [
    availableNowOnly,
    effectiveParams.city,
    effectiveParams.region,
    effectiveParams.sortBy,
    selectedMinimumRating,
    selectedMode,
    selectedPricePreset.id,
    selectedPricePreset.label,
    selectedSpecialization,
    smartInterpretation.availableNow,
    smartInterpretation.consultationMode,
    smartInterpretation.specialization,
    sortPreference
  ]);

  const activeFiltersCount = [
    Boolean(selectedSpecialization),
    selectedMode !== "any",
    availableNowOnly,
    selectedPricePreset.id !== "all",
    Boolean(selectedMinimumRating),
    locationPreference !== "all",
    sortPreference !== "auto"
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedSpecialization(null);
    setSelectedMode("any");
    setAvailableNowOnly(false);
    setSortPreference("auto");
    setSelectedPricePresetId("all");
    setSelectedMinimumRating(null);
    setLocationPreference("all");
  };

  return {
    search,
    setSearch,
    selectedSpecialization,
    setSelectedSpecialization,
    selectedMode,
    setSelectedMode,
    availableNowOnly,
    setAvailableNowOnly,
    sortPreference,
    setSortPreference,
    selectedPricePresetId,
    setSelectedPricePresetId,
    selectedMinimumRating,
    setSelectedMinimumRating,
    locationPreference,
    setLocationPreference,
    pricePresets,
    ratingOptions: DOCTOR_RATING_OPTIONS,
    locationOptions,
    activeFiltersCount,
    effectiveParams,
    effectiveSummary,
    specializationChips,
    selectedPricePreset,
    clearFilters,
    doctorsQuery,
    filtersQuery
  };
}

function interpretDoctorSearchQuery(search: string, filters?: DoctorSearchFiltersEntity) {
  const normalizedSearch = normalizeArabicText(search);
  if (!normalizedSearch) {
    return {
      specialization: undefined,
      city: undefined,
      region: undefined,
      consultationMode: undefined,
      availableNow: false,
      sortBy: undefined
    };
  }

  return {
    specialization: findBestTextMatch(normalizedSearch, filters?.specializations ?? []),
    city: findBestTextMatch(normalizedSearch, filters?.cities ?? []),
    region: findBestTextMatch(normalizedSearch, filters?.regions ?? []),
    consultationMode: detectConsultationMode(normalizedSearch),
    availableNow: AVAILABLE_NOW_KEYWORDS.some((keyword) => normalizedSearch.includes(normalizeArabicText(keyword))),
    sortBy: detectSortBy(normalizedSearch)
  };
}

function buildSpecializationChips(
  filters: DoctorSearchFiltersEntity | undefined,
  search: string,
  doctors: Array<{ specialization: string }>,
  selectedSpecialization: string | null
) {
  const rankedFilters = rankMatches(search, filters?.specializations ?? []);
  const resultSpecializations = rankMatches(
    search,
    Array.from(new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)))
  );

  const merged = [selectedSpecialization, ...rankedFilters, ...resultSpecializations].filter(
    (item): item is string => Boolean(item)
  );

  return Array.from(new Set(merged)).slice(0, 10);
}

function buildLocationOptions(city?: string | null, region?: string | null) {
  const options: Array<{ label: string; value: DoctorLocationPreference }> = [
    { label: "كل المناطق", value: "all" }
  ];

  if (city) {
    options.push({ label: "نفس المدينة", value: "city" });
  }

  if (region) {
    options.push({ label: "نفس المنطقة", value: "region" });
  }

  return options;
}

function buildPricePresets(priceRange?: { min: number; max: number }) {
  const maxValue = priceRange?.max ?? 0;
  const minValue = priceRange?.min ?? 0;

  const presets: DoctorPricePreset[] = [{ id: "all", label: "الكل" }];

  if (maxValue <= 0) {
    return presets;
  }

  const budgetMax = roundToNiceStep(Math.max(maxValue * 0.25, 100));
  const balancedMax = roundToNiceStep(Math.max(maxValue * 0.6, budgetMax + 100));
  const safeBudgetMax = Math.min(budgetMax, maxValue);
  const safeBalancedMax = Math.min(balancedMax, maxValue);

  if (safeBudgetMax > minValue) {
    presets.push({
      id: "budget",
      label: `${minValue}-${safeBudgetMax}`,
      minPrice: minValue,
      maxPrice: safeBudgetMax
    });
  }

  if (safeBalancedMax > safeBudgetMax) {
    presets.push({
      id: "balanced",
      label: `${safeBudgetMax}-${safeBalancedMax}`,
      minPrice: safeBudgetMax,
      maxPrice: safeBalancedMax
    });
  }

  if (maxValue > safeBalancedMax) {
    presets.push({
      id: "premium",
      label: `${safeBalancedMax}+`,
      minPrice: safeBalancedMax
    });
  }

  return presets;
}

function roundToNiceStep(value: number) {
  if (value <= 200) {
    return Math.ceil(value / 50) * 50;
  }

  return Math.ceil(value / 100) * 100;
}

function rankMatches(search: string, options: string[]) {
  const normalizedSearch = normalizeArabicText(search);
  const uniqueOptions = Array.from(new Set(options));

  if (!normalizedSearch) {
    return uniqueOptions.slice(0, 8);
  }

  return uniqueOptions
    .map((option) => ({
      option,
      score: getTextMatchScore(normalizedSearch, option)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.option.length - right.option.length)
    .map((item) => item.option)
    .slice(0, 8);
}

function detectConsultationMode(search: string): DoctorConsultationMode | undefined {
  if (ONLINE_KEYWORDS.some((keyword) => search.includes(normalizeArabicText(keyword)))) {
    return "online";
  }

  if (IN_PERSON_KEYWORDS.some((keyword) => search.includes(normalizeArabicText(keyword)))) {
    return "in_person";
  }

  return undefined;
}

function detectSortBy(search: string): DoctorSortBy | undefined {
  const matched = SORT_KEYWORDS.find((item) =>
    item.keywords.some((keyword) => search.includes(normalizeArabicText(keyword)))
  );

  return matched?.sortBy;
}

function findBestTextMatch(search: string, options: string[]) {
  const rankedOptions = options
    .map((option) => ({
      option,
      score: getTextMatchScore(search, option)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || right.option.length - left.option.length);

  return rankedOptions[0]?.option;
}

function getTextMatchScore(search: string, candidate: string) {
  const normalizedCandidate = normalizeArabicText(candidate);
  if (!normalizedCandidate) {
    return 0;
  }

  if (search === normalizedCandidate) {
    return 5;
  }

  if (search.includes(normalizedCandidate)) {
    return 4;
  }

  if (normalizedCandidate.includes(search) && search.length >= 2) {
    return 3;
  }

  const searchWords = search.split(/\s+/).filter(Boolean);
  const candidateWords = normalizedCandidate.split(/\s+/).filter(Boolean);
  const sharedWords = searchWords.filter((word) => candidateWords.includes(word)).length;

  return sharedWords;
}

function normalizeArabicText(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s]/gi, " ")
    .replace(/\s+/g, " ");
}

function getSortLabel(value: DoctorSortBy) {
  return DOCTOR_SORT_OPTIONS.find((item) => item.value === value)?.label ?? "الأقرب لحالتك";
}
