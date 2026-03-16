import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

export const listAlertsQuerySchema = paginationSchema.extend({
  status: z.enum(["new", "reviewing", "resolved"]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional()
});

export const alertIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const updateAlertStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "resolved"])
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
