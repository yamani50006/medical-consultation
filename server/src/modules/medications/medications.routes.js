import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import medicationsController from "./medications.controller.js";
import { addMedicationsSchema, updateMedicationSchema } from "./medications.validator.js";

const router = Router();

router.get(
  "/treatment-plan/:treatmentPlanId",
  authMiddleware,
  roleMiddleware("PATIENT", "DOCTOR", "ADMIN"),
  medicationsController.listTreatmentPlanMedications
);
router.post(
  "/treatment-plan/:treatmentPlanId",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(addMedicationsSchema),
  medicationsController.addMedications
);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(updateMedicationSchema),
  medicationsController.updateMedication
);
router.delete("/:id", authMiddleware, roleMiddleware("DOCTOR"), medicationsController.deleteMedication);

export default router;
