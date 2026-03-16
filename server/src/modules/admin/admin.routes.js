import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import adminController from "./admin.controller.js";
import {
  doctorIdParamsSchema,
  doctorModerationSchema,
  doctorSoftDeleteSchema,
  doctorWarningSchema,
  listAppointmentsQuerySchema,
  listConsultationsQuerySchema,
  listAdminDoctorsQuerySchema,
  listPendingDoctorsQuerySchema,
  listPostsQuerySchema,
  listUsersQuerySchema,
  updateDoctorBasicInfoSchema,
  validate
} from "./admin.validator.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/doctors", validate(listAdminDoctorsQuerySchema), adminController.listDoctors);
router.get(
  "/doctors/pending",
  validate(listPendingDoctorsQuerySchema),
  adminController.listPendingDoctors
);
router.get("/doctors/:id", validate(doctorIdParamsSchema, "params"), adminController.getDoctorDetails);
router.patch("/doctors/:id/approve", validate(doctorIdParamsSchema, "params"), adminController.approveDoctor);
router.patch(
  "/doctors/:id/reject",
  validate(doctorIdParamsSchema, "params"),
  validate(doctorModerationSchema, "body"),
  adminController.rejectDoctor
);
router.patch(
  "/doctors/:id/suspend",
  validate(doctorIdParamsSchema, "params"),
  validate(doctorModerationSchema, "body"),
  adminController.suspendDoctor
);
router.patch(
  "/doctors/:id/reactivate",
  validate(doctorIdParamsSchema, "params"),
  validate(doctorModerationSchema.partial(), "body"),
  adminController.reactivateDoctor
);
router.delete(
  "/doctors/:id",
  validate(doctorIdParamsSchema, "params"),
  validate(doctorSoftDeleteSchema, "body"),
  adminController.softDeleteDoctor
);
router.patch("/doctors/:id/verify", validate(doctorIdParamsSchema, "params"), adminController.verifyDoctor);
router.patch(
  "/doctors/:id/basic-info",
  validate(doctorIdParamsSchema, "params"),
  validate(updateDoctorBasicInfoSchema, "body"),
  adminController.updateDoctorBasicInfo
);
router.post(
  "/doctors/:id/warnings",
  validate(doctorIdParamsSchema, "params"),
  validate(doctorWarningSchema, "body"),
  adminController.sendDoctorWarning
);
router.get("/users", validate(listUsersQuerySchema), adminController.listUsers);
router.get("/posts", validate(listPostsQuerySchema), adminController.listPosts);
router.get("/consultations", validate(listConsultationsQuerySchema), adminController.listConsultations);
router.get("/appointments", validate(listAppointmentsQuerySchema), adminController.listAppointments);

export default router;
