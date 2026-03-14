import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const registerPatientSchema = z.object({
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.coerce.date(),
  bloodType: z.string().max(10).optional(),
  chronicDiseases: z.string().max(500).optional(),
  currentMedications: z.string().max(500).optional()
});

export const registerDoctorSchema = z.object({
  fullName: z.string().min(3).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  specialization: z.string().min(2).max(120),
  yearsOfExperience: z.coerce.number().int().min(0).max(70),
  bio: z.string().min(10).max(2000),
  licenseNumber: z.string().min(5).max(120)
});

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
