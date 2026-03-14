import { z } from "zod";

export const createReviewSchema = z
  .object({
    consultationId: z.string().min(5).max(64).optional(),
    appointmentId: z.string().min(5).max(64).optional(),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional()
  })
  .refine(
    (value) =>
      Number(Boolean(value.consultationId)) + Number(Boolean(value.appointmentId)) === 1,
    {
      message: "Provide exactly one completed consultation or appointment"
    }
  );

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});
