import { z } from "zod";

export const updateMedicalRecordSchema = z.object({
  allergies: z.string().max(2000).optional(),
  chronicDiseases: z.string().max(2000).optional(),
  surgeriesHistory: z.string().max(2000).optional(),
  familyHistory: z.string().max(2000).optional(),
  lifestyleNotes: z.string().max(2000).optional()
});
