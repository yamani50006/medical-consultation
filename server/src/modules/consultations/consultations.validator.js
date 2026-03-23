import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const optionalBooleanSchema = z.preprocess((value) => {
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

function hasValidPriceRange(payload) {
  return payload.minPrice === undefined || payload.maxPrice === undefined || payload.maxPrice >= payload.minPrice;
}

export const createConsultationSchema = z.object({
  doctorId: z.string().min(5).max(64),
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  preferredTime: z.string().trim().max(160).optional(),
  requestType: z.enum(["online", "follow-up", "urgent"]).optional()
});

export const requestConsultationSchema = z
  .object({
    doctorId: z.string().min(5).max(64).optional(),
    subject: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    specialization: z.string().trim().min(2).max(120).optional(),
    symptomsText: z.string().trim().max(2000).optional(),
    symptoms: z.array(z.string().trim().min(2).max(120)).max(15).optional(),
    requestType: z.enum(["online", "follow-up", "urgent"]).optional(),
    preferredTime: z.string().trim().max(160).optional(),
    city: z.string().trim().min(2).max(120).optional(),
    region: z.string().trim().min(2).max(120).optional(),
    patientCity: z.string().trim().min(2).max(120).optional(),
    patientRegion: z.string().trim().min(2).max(120).optional(),
    consultationMode: z.enum(["any", "online", "in_person"]).optional(),
    availableNow: optionalBooleanSchema,
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    autoAssignDoctor: z.boolean().optional()
  })
  .refine((payload) => Boolean(payload.doctorId) || payload.autoAssignDoctor === true, {
    message: "Choose a doctor or let the platform choose the best doctor"
  })
  .refine(hasValidPriceRange, {
    message: "Validation failed"
  });

export const quickMatchConsultationSchema = z
  .object({
    subject: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    requestType: z.enum(["online", "follow-up", "urgent"]).optional(),
    preferredTime: z.string().trim().max(160).optional(),
    specialization: z.string().trim().min(2).max(120).optional(),
    symptomsText: z.string().trim().max(2000).optional(),
    symptoms: z.array(z.string().trim().min(2).max(120)).max(15).optional(),
    city: z.string().trim().min(2).max(120).optional(),
    region: z.string().trim().min(2).max(120).optional(),
    patientCity: z.string().trim().min(2).max(120).optional(),
    patientRegion: z.string().trim().min(2).max(120).optional(),
    consultationMode: z.enum(["any", "online", "in_person"]).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional()
  })
  .refine(hasValidPriceRange, {
    message: "Validation failed"
  });

export const respondConsultationSchema = z.object({
  doctorResponse: z.string().min(5).max(5000),
  status: z.enum(["pending", "accepted", "completed", "cancelled"]).optional()
});

export const updateConsultationStatusSchema = z.object({
  status: z.enum(["accepted", "completed", "cancelled"]),
  doctorResponse: z.string().min(5).max(5000).optional(),
  reportUrl: z.string().url().max(2000).optional()
});

export const listConsultationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["pending", "accepted", "completed", "cancelled"]).optional()
});

export const consultationIdParamsSchema = z.object({
  id: z.string().min(5).max(64)
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
