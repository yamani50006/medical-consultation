import { z } from "zod";

export const bookingSchema = z.object({
  appointmentDate: z.string().min(5, "اختر التاريخ والوقت"),
  notes: z.string().max(500).optional()
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

