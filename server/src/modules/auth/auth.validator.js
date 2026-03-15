import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const optionalTrimmedStringSchema = (minimum, maximum) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim();
      return normalizedValue === "" ? undefined : normalizedValue;
    }

    return value;
  }, z.string().min(minimum).max(maximum).optional());

const consultationModesSchema = z
  .object({
    supportsOnline: z.boolean().optional().default(true),
    supportsInPerson: z.boolean().optional().default(true)
  })
  .refine((payload) => payload.supportsOnline || payload.supportsInPerson, {
    message: "At least one consultation mode must be enabled"
  });

export const registerPatientSchema = z.object({
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.coerce.date(),
  city: optionalTrimmedStringSchema(2, 120),
  region: optionalTrimmedStringSchema(2, 120),
  bloodType: z.string().max(10).optional(),
  chronicDiseases: z.string().max(500).optional(),
  currentMedications: z.string().max(500).optional()
});

export const registerDoctorSchema = z
  .object({
    fullName: z.string().min(3).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    specialization: z.string().min(2).max(120),
    city: optionalTrimmedStringSchema(2, 120),
    region: optionalTrimmedStringSchema(2, 120),
    yearsOfExperience: z.coerce.number().int().min(0).max(70),
    bio: z.string().min(10).max(2000),
    licenseNumber: z.string().min(5).max(120),
    consultationFee: z.coerce.number().int().min(0).max(100000).optional(),
    isAvailableNow: z.boolean().optional()
  })
  .and(consultationModesSchema);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64)
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
