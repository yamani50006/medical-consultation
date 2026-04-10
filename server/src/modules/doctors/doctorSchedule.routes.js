import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";

import doctorScheduleController from "./doctorSchedule.controller.js";

const router = Router();

router.post(
  "/schedule",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorScheduleController.setDailySchedule
);

router.get(
  "/:doctorId/daily-schedule",
  authMiddleware,
  doctorScheduleController.getDailySchedule
);



export default router;
