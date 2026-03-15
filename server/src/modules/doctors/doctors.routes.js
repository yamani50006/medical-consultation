import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import doctorsController from "./doctors.controller.js";
import {
  getRecommendedDoctorsQuerySchema,
  listDoctorsQuerySchema,
  updateDoctorProfileSchema,
  validate
} from "./doctors.validator.js";

const router = Router();

router.get("/", validate(listDoctorsQuerySchema, "query"), doctorsController.listDoctors);
router.get("/filters", doctorsController.getDoctorFilters);
router.get(
  "/recommended",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validate(getRecommendedDoctorsQuerySchema, "query"),
  doctorsController.listRecommendedDoctors
);
router.get("/me/profile", authMiddleware, roleMiddleware("DOCTOR"), doctorsController.getMyProfile);
router.patch(
  "/me/profile",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(updateDoctorProfileSchema),
  doctorsController.updateMyProfile
);
router.get("/:id", doctorsController.getDoctorById);

export default router;
