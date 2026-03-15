import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const nullableTrimmedStringSchema = (minimum, maximum) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim();
      return normalizedValue === "" ? null : normalizedValue;
    }

    return value;
  }, z.string().min(minimum).max(maximum).nullable().optional());

const booleanQuerySchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean().optional());

const listDoctorsQueryBaseSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  specialization: z.string().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  region: z.string().trim().max(120).optional(),
  consultationMode: z.enum(["any", "online", "in_person"]).optional(),
  availableNow: booleanQuerySchema,
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z
    .enum(["best_match", "top_rated", "nearest", "most_consultations", "price_low_to_high"])
    .optional(),
  search: z.string().max(120).optional()
});

export const listDoctorsQuerySchema = listDoctorsQueryBaseSchema.refine(
  (query) => query.minPrice === undefined || query.maxPrice === undefined || query.maxPrice >= query.minPrice,
  {
    message: "Validation failed"
  }
);

export const getRecommendedDoctorsQuerySchema = listDoctorsQueryBaseSchema.extend({
  patientCity: z.string().trim().max(120).optional(),
  patientRegion: z.string().trim().max(120).optional(),
  symptomsText: z.string().trim().max(2000).optional()
}).refine(
  (query) => query.minPrice === undefined || query.maxPrice === undefined || query.maxPrice >= query.minPrice,
  {
    message: "Validation failed"
  }
);

export const updateDoctorProfileSchema = z.object({
  specialization: z.string().min(2).max(120).optional(),
  city: nullableTrimmedStringSchema(2, 120),
  region: nullableTrimmedStringSchema(2, 120),
  yearsOfExperience: z.coerce.number().int().min(0).max(70).optional(),
  bio: z.string().min(10).max(2000).optional(),
  licenseNumber: z.string().min(5).max(120).optional(),
  consultationFee: z.coerce.number().int().min(0).max(100000).nullable().optional(),
  supportsOnline: z.boolean().optional(),
  supportsInPerson: z.boolean().optional(),
  isAvailableNow: z.boolean().optional()
});

export function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      return next();
    } catch (error) {
      return next(new AppError("Validation failed", 422, "VALIDATION_ERROR", error.flatten?.()));
    }
  };
}
