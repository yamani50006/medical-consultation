import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  specialization: z.string().min(2).max(120),
  status: z.enum(["published", "draft"]).optional()
});

export const updatePostSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  specialization: z.string().min(2).max(120).optional(),
  status: z.enum(["published", "draft"]).optional()
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  specialization: z.string().max(120).optional(),
  search: z.string().max(120).optional(),
  status: z.enum(["published", "draft"]).optional()
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
