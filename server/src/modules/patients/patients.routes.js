import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import patientsController from "./patients.controller.js";
import { updatePatientProfileSchema, validate } from "./patients.validator.js";

const router = Router();

router.get("/me/profile", authMiddleware, roleMiddleware("PATIENT"), patientsController.getMyProfile);
router.patch(
  "/me/profile",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(updatePatientProfileSchema),
  patientsController.updateMyProfile
);

export default router;
