import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import consultationsController from "./consultations.controller.js";
import {
  createConsultationSchema,
  listConsultationsQuerySchema,
  respondConsultationSchema,
  updateConsultationStatusSchema,
  validate
} from "./consultations.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(createConsultationSchema),
  consultationsController.createConsultation
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(listConsultationsQuerySchema, "query"),
  consultationsController.listMyConsultations
);
router.get(
  "/assigned",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(listConsultationsQuerySchema, "query"),
  consultationsController.listAssignedConsultations
);
router.patch(
  "/:id/respond",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(respondConsultationSchema),
  consultationsController.respondToConsultation
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(updateConsultationStatusSchema),
  consultationsController.updateConsultationStatus
);

export default router;
