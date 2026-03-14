import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import appointmentsController from "./appointments.controller.js";
import {
  bookAppointmentSchema,
  listAppointmentsQuerySchema,
  updateAppointmentStatusSchema,
  validate
} from "./appointments.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(bookAppointmentSchema),
  appointmentsController.bookAppointment
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(listAppointmentsQuerySchema, "query"),
  appointmentsController.listMyAppointments
);
router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(listAppointmentsQuerySchema, "query"),
  appointmentsController.listDoctorAppointments
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(updateAppointmentStatusSchema),
  appointmentsController.updateAppointmentStatus
);

export default router;
