import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import authController from "./auth.controller.js";
import {
  loginSchema,
  registerDoctorSchema,
  registerPatientSchema,
  validate
} from "./auth.validator.js";

const router = Router();

router.post("/register/patient", validate(registerPatientSchema), authController.registerPatient);
router.post("/register/doctor", validate(registerDoctorSchema), authController.registerDoctor);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
