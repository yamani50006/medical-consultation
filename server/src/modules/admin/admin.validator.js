import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const listPendingDoctorsQuerySchema = paginationSchema;

export const listUsersQuerySchema = paginationSchema.extend({
  role: z.enum(["admin", "doctor", "patient"]).optional(),
  status: z.enum(["active", "pending", "rejected"]).optional(),
  search: z.string().max(120).optional()
});

export const listPostsQuerySchema = paginationSchema.extend({
  status: z.enum(["published", "draft"]).optional(),
  specialization: z.string().max(120).optional(),
  search: z.string().max(120).optional()
});

export const listConsultationsQuerySchema = paginationSchema.extend({
  status: z.enum(["pending", "accepted", "completed", "cancelled"]).optional(),
  search: z.string().max(120).optional()
});

export const listAppointmentsQuerySchema = paginationSchema.extend({
  status: z.enum(["scheduled", "completed", "cancelled"]).optional()
});

export function validate(schema, source = "query") {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      return next();
    } catch (error) {
      return next(new AppError("Validation failed", 422, "VALIDATION_ERROR", error.flatten?.()));
    }
  };
}
