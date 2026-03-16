import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import analyticsController from "./analytics.controller.js";
import { doctorAnalyticsParamsSchema, validate } from "./analytics.validator.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/overview", analyticsController.getOverview);
router.get("/doctors/:id", validate(doctorAnalyticsParamsSchema, "params"), analyticsController.getDoctorPerformance);

export default router;
