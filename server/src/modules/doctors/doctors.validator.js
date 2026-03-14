import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const listDoctorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  specialization: z.string().max(120).optional(),
  search: z.string().max(120).optional()
});

export const updateDoctorProfileSchema = z.object({
  specialization: z.string().min(2).max(120).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(70).optional(),
  bio: z.string().min(10).max(2000).optional(),
  licenseNumber: z.string().min(5).max(120).optional()
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
