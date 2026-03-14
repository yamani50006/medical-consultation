import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const createConsultationSchema = z.object({
  doctorId: z.string().min(5).max(64),
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000)
});

export const respondConsultationSchema = z.object({
  doctorResponse: z.string().min(5).max(5000),
  status: z.enum(["pending", "accepted", "completed", "cancelled"]).optional()
});

export const updateConsultationStatusSchema = z.object({
  status: z.enum(["accepted", "completed", "cancelled"])
});

export const listConsultationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["pending", "accepted", "completed", "cancelled"]).optional()
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
