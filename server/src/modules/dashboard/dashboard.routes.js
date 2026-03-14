import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import dashboardController from "./dashboard.controller.js";

const router = Router();

router.get("/patient", authMiddleware, roleMiddleware("PATIENT"), dashboardController.getPatientDashboard);
router.get("/doctor", authMiddleware, roleMiddleware("DOCTOR"), dashboardController.getDoctorDashboard);
router.get("/admin", authMiddleware, roleMiddleware("ADMIN"), dashboardController.getAdminDashboard);
router.get(
  "/admin/analytics",
  authMiddleware,
  roleMiddleware("ADMIN"),
  dashboardController.getAdminAnalytics
);

export default router;
