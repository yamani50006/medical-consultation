import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const usersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(["admin", "doctor", "patient"]).optional(),
  status: z.enum(["active", "pending", "rejected"]).optional(),
  search: z.string().max(100).optional()
});

const profileImageSchema = z
  .string()
  .max(3_000_000)
  .refine(
    (value) =>
      value.startsWith("data:image/") ||
      /^https?:\/\/.+/i.test(value),
    "Profile image must be a valid image data URL or HTTP URL"
  );

export const updateCurrentUserSchema = z
  .object({
    fullName: z.string().trim().min(3).max(120).optional(),
    email: z.string().trim().email().max(160).optional(),
    profileImageUrl: profileImageSchema.nullable().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one account field is required"
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
