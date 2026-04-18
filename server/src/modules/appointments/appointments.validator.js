import { z } from "zod";
import AppError from "../../core/errors/AppError.js";

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(5).max(64),
  appointmentDate: z.coerce.date(),
  slotNumber: z.coerce.number().int().min(1).optional(),
  notes: z.string().max(2000).optional()
});


export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["scheduled", "completed", "cancelled"])
});

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["scheduled", "completed", "cancelled"]).optional()
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
