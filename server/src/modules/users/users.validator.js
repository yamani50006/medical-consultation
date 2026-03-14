import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const usersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(["admin", "doctor", "patient"]).optional(),
  status: z.enum(["active", "pending", "rejected"]).optional(),
  search: z.string().max(100).optional()
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
