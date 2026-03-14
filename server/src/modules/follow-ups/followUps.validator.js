import { z } from "zod";

export const createFollowUpSchema = z.object({
  symptomsStatus: z.string().min(3).max(500),
  painLevel: z.coerce.number().int().min(0).max(10).optional(),
  sideEffects: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional()
});

export const listFollowUpsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  treatmentPlanId: z.string().min(5).max(64).optional(),
  patientId: z.string().min(5).max(64).optional()
});

export const addDoctorNoteSchema = z.object({
  doctorNote: z.string().min(3).max(2000)
});
