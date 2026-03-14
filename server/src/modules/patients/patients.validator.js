import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const updatePatientProfileSchema = z.object({
  gender: z.enum(["male", "female", "other"]).optional(),
  dateOfBirth: z.coerce.date().optional(),
  bloodType: z.string().max(10).optional(),
  chronicDiseases: z.string().max(500).optional(),
  currentMedications: z.string().max(500).optional()
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
