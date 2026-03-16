import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const doctorAnalyticsParamsSchema = z.object({
  id: z.string().min(1)
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
