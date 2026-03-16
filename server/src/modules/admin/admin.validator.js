import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const optionalQueryString = (schema) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, schema.optional());

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: optionalQueryString(z.string().max(50)),
  sortOrder: optionalQueryString(z.enum(["asc", "desc"]))
});

export const listPendingDoctorsQuerySchema = paginationSchema;

export const listUsersQuerySchema = paginationSchema.extend({
  role: optionalQueryString(z.enum(["admin", "doctor", "patient"])),
  status: optionalQueryString(z.enum(["active", "suspended", "pending", "rejected"])),
  search: optionalQueryString(z.string().max(120))
});

export const listPostsQuerySchema = paginationSchema.extend({
  status: optionalQueryString(z.enum(["published", "draft"])),
  specialization: optionalQueryString(z.string().max(120)),
  search: optionalQueryString(z.string().max(120))
});

export const listConsultationsQuerySchema = paginationSchema.extend({
  status: optionalQueryString(z.enum(["pending", "accepted", "completed", "cancelled"])),
  search: optionalQueryString(z.string().max(120))
});

export const listAppointmentsQuerySchema = paginationSchema.extend({
  status: optionalQueryString(z.enum(["scheduled", "completed", "cancelled"]))
});

export const listAdminDoctorsQuerySchema = paginationSchema.extend({
  status: optionalQueryString(z.enum(["active", "suspended", "pending", "rejected"])),
  approvalStatus: optionalQueryString(z.enum(["pending", "approved", "rejected"])),
  specialization: optionalQueryString(z.string().max(120)),
  city: optionalQueryString(z.string().max(120)),
  region: optionalQueryString(z.string().max(120)),
  search: optionalQueryString(z.string().max(120)),
  includeDeleted: z.coerce.boolean().optional(),
  sortBy: optionalQueryString(
    z.enum(["joinedAt", "lastActiveAt", "rating", "consultations", "consultationsToday", "consultationsWeek"])
  ),
  sortOrder: optionalQueryString(z.enum(["asc", "desc"]))
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
