import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import alertsController from "./alerts.controller.js";
import {
  alertIdParamsSchema,
  listAlertsQuerySchema,
  updateAlertStatusSchema,
  validate
} from "./alerts.validator.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/", validate(listAlertsQuerySchema), alertsController.listAlerts);
router.patch(
  "/:id/status",
  validate(alertIdParamsSchema, "params"),
  validate(updateAlertStatusSchema, "body"),
  alertsController.updateAlertStatus
);

export default router;
