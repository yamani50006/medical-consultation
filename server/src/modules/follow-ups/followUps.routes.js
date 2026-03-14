import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import followUpsController from "./followUps.controller.js";
import {
  addDoctorNoteSchema,
  createFollowUpSchema,
  listFollowUpsQuerySchema
} from "./followUps.validator.js";

const router = Router();

router.post(
  "/treatment-plan/:treatmentPlanId",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validateRequest(createFollowUpSchema),
  followUpsController.createFollowUp
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validateRequest(listFollowUpsQuerySchema, "query"),
  followUpsController.listMyFollowUps
);
router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(listFollowUpsQuerySchema, "query"),
  followUpsController.listDoctorFollowUps
);
router.patch(
  "/:id/note",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(addDoctorNoteSchema),
  followUpsController.addDoctorNote
);

export default router;
