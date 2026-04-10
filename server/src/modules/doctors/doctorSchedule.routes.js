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

router.get(
  "/me/schedules",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorScheduleController.listMySchedules
);

router.delete(
  "/schedules/:id",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorScheduleController.deleteMySchedule
);

router.patch(
  "/schedules/:id",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorScheduleController.updateMySchedule
);





export default router;
