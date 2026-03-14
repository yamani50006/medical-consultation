import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import medicalRecordsController from "./medicalRecords.controller.js";
import { updateMedicalRecordSchema } from "./medicalRecords.validator.js";

const router = Router();

router.get("/me", authMiddleware, roleMiddleware("PATIENT"), medicalRecordsController.getMyMedicalRecord);
router.put(
  "/me",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validateRequest(updateMedicalRecordSchema),
  medicalRecordsController.updateMyMedicalRecord
);
router.get(
  "/patient/:patientId",
  authMiddleware,
  roleMiddleware("DOCTOR", "ADMIN"),
  medicalRecordsController.getPatientMedicalRecord
);

export default router;
