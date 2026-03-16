import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

export const listPendingDoctorsQuerySchema = paginationSchema;

export const listUsersQuerySchema = paginationSchema.extend({
  role: z.enum(["admin", "doctor", "patient"]).optional(),
  status: z.enum(["active", "suspended", "pending", "rejected"]).optional(),
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

export const listAdminDoctorsQuerySchema = paginationSchema.extend({
  status: z.enum(["active", "suspended", "pending", "rejected"]).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  specialization: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  region: z.string().max(120).optional(),
  search: z.string().max(120).optional(),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["joinedAt", "lastActiveAt", "rating", "consultations", "consultationsToday", "consultationsWeek"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

export const doctorIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const doctorModerationSchema = z.object({
  reason: z.string().trim().min(3).max(500),
  note: z.string().trim().max(1000).optional()
});

export const doctorSoftDeleteSchema = z.object({
  reason: z.string().trim().min(3).max(500),
  note: z.string().trim().max(1000).optional()
});

export const doctorWarningSchema = z.object({
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(1000),
  severity: z.enum(["low", "medium", "high"]).optional()
});

export const updateDoctorBasicInfoSchema = z.object({
  fullName: z.string().trim().min(3).max(120).optional(),
  specialization: z.string().trim().min(2).max(120).optional(),
  city: z.string().trim().max(120).nullable().optional(),
  region: z.string().trim().max(120).nullable().optional(),
  bio: z.string().trim().min(10).max(2000).optional(),
  consultationFee: z.coerce.number().int().min(0).max(100000).nullable().optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  supportsOnline: z.boolean().optional(),
  supportsInPerson: z.boolean().optional()
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
