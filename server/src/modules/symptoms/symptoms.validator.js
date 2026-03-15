import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const analyzeSymptomsSchema = z.object({
  symptomsText: z.string().trim().max(2000).optional(),
  symptoms: z.array(z.string().trim().min(2).max(120)).max(15).optional()
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
