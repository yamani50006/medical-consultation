import { z } from "zod";

const treatmentPlanStatusEnum = z.enum(["active", "completed", "cancelled"]);

export const createTreatmentPlanSchema = z.object({
  patientId: z.string().min(5).max(64),
  consultationId: z.string().min(5).max(64).optional(),
  title: z.string().min(3).max(200),
  diagnosisSummary: z.string().min(10).max(5000),
  instructions: z.string().min(10).max(5000),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
});

export const updateTreatmentPlanSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    diagnosisSummary: z.string().min(10).max(5000).optional(),
    instructions: z.string().min(10).max(5000).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: treatmentPlanStatusEnum.optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one treatment plan field is required"
  });

export const listTreatmentPlansQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: treatmentPlanStatusEnum.optional(),
  search: z.string().min(1).max(200).optional(),
  patientId: z.string().min(5).max(64).optional()
});
