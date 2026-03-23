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

const optionalTrimmedStringSchema = (minimum, maximum) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string") {
      return value.trim();
    }

    return value;
  }, z.string().min(minimum).max(maximum).optional());

const optionalDateSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();
    return normalizedValue === "" ? undefined : normalizedValue;
  }

  return value;
}, z.coerce.date().optional());

const profileImageSchema = z
  .string()
  .max(3_000_000)
  .refine(
    (value) =>
      value.startsWith("data:image/") ||
      /^https?:\/\/.+/i.test(value),
    "Profile image must be a valid image data URL or HTTP URL"
  );

export const updatePatientProfileSchema = z.object({
  fullName: optionalTrimmedStringSchema(3, 120),
  profileImageUrl: z.preprocess((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim();
      return normalizedValue === "" ? null : normalizedValue;
    }

    return value;
  }, profileImageSchema.nullable().optional()),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: optionalDateSchema,
  city: nullableTrimmedStringSchema(2, 120),
  region: nullableTrimmedStringSchema(2, 120),
  bloodType: nullableTrimmedStringSchema(1, 10),
  chronicDiseases: nullableTrimmedStringSchema(1, 500),
  currentMedications: nullableTrimmedStringSchema(1, 500)
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
