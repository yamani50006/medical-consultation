import { z } from "zod";

const medicationItemSchema = z.object({
  medicationName: z.string().min(2).max(200),
  dosage: z.string().min(1).max(200),
  frequency: z.string().min(1).max(200),
  durationInDays: z.coerce.number().int().min(1).max(365),
  notes: z.string().max(1000).optional()
});

export const addMedicationsSchema = z.object({
  items: z.array(medicationItemSchema).min(1).max(20)
});

export const updateMedicationSchema = medicationItemSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one medication field is required"
  });
