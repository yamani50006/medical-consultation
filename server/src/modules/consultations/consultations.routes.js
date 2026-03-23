import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import consultationsController from "./consultations.controller.js";
import {
  consultationIdParamsSchema,
  createConsultationSchema,
  quickMatchConsultationSchema,
  requestConsultationSchema,
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
router.post(
  "/request",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(requestConsultationSchema),
  consultationsController.requestConsultation
);
router.post(
  "/quick-match",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(quickMatchConsultationSchema),
  consultationsController.quickMatchConsultation
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
router.get(
  "/:id",
  authMiddleware,
  validate(consultationIdParamsSchema, "params"),
  consultationsController.getConsultationById
);
router.post(
  "/:id/pay",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(consultationIdParamsSchema, "params"),
  consultationsController.payConsultation
);
router.patch(
  "/:id/archive",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(consultationIdParamsSchema, "params"),
  consultationsController.archiveConsultation
);
router.post(
  "/:id/reopen",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(consultationIdParamsSchema, "params"),
  consultationsController.reopenConsultation
);
router.patch(
  "/:id/respond",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(consultationIdParamsSchema, "params"),
  validate(respondConsultationSchema),
  consultationsController.respondToConsultation
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(consultationIdParamsSchema, "params"),
  validate(updateConsultationStatusSchema),
  consultationsController.updateConsultationStatus
);

export default router;
