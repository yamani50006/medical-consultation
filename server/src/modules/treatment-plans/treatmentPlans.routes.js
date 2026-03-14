import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import treatmentPlansController from "./treatmentPlans.controller.js";
import {
  createTreatmentPlanSchema,
  listTreatmentPlansQuerySchema,
  updateTreatmentPlanSchema
} from "./treatmentPlans.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(createTreatmentPlanSchema),
  treatmentPlansController.createTreatmentPlan
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validateRequest(listTreatmentPlansQuerySchema, "query"),
  treatmentPlansController.listPatientTreatmentPlans
);
router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(listTreatmentPlansQuerySchema, "query"),
  treatmentPlansController.listDoctorTreatmentPlans
);
router.get("/:id", authMiddleware, treatmentPlansController.getTreatmentPlanById);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(updateTreatmentPlanSchema),
  treatmentPlansController.updateTreatmentPlan
);

export default router;
