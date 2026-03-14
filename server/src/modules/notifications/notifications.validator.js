import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  isRead: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => {
      if (value === "true") {
        return true;
      }

      if (value === "false") {
        return false;
      }

      return value;
    })
    .optional(),
  type: z
    .enum([
      "generic",
      "treatment_plan_created",
      "treatment_plan_updated",
      "appointment_booked",
      "consultation_accepted",
      "follow_up_submitted",
      "doctor_approved",
      "group_post_published"
    ])
    .optional()
});
