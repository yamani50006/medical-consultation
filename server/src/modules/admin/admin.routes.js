import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import adminController from "./admin.controller.js";
import {
  listAppointmentsQuerySchema,
  listConsultationsQuerySchema,
  listPendingDoctorsQuerySchema,
  listPostsQuerySchema,
  listUsersQuerySchema,
  validate
} from "./admin.validator.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get(
  "/doctors/pending",
  validate(listPendingDoctorsQuerySchema),
  adminController.listPendingDoctors
);
router.patch("/doctors/:id/approve", adminController.approveDoctor);
router.patch("/doctors/:id/reject", adminController.rejectDoctor);
router.get("/users", validate(listUsersQuerySchema), adminController.listUsers);
router.get("/posts", validate(listPostsQuerySchema), adminController.listPosts);
router.get("/consultations", validate(listConsultationsQuerySchema), adminController.listConsultations);
router.get("/appointments", validate(listAppointmentsQuerySchema), adminController.listAppointments);

export default router;
