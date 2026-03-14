import { Router } from "express";
import adminRoutes from "../modules/admin/admin.routes.js";
import appointmentsRoutes from "../modules/appointments/appointments.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import consultationsRoutes from "../modules/consultations/consultations.routes.js";
import doctorsRoutes from "../modules/doctors/doctors.routes.js";
import patientsRoutes from "../modules/patients/patients.routes.js";
import postsRoutes from "../modules/posts/posts.routes.js";
import usersRoutes from "../modules/users/users.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/doctors", doctorsRoutes);
router.use("/patients", patientsRoutes);
router.use("/posts", postsRoutes);
router.use("/consultations", consultationsRoutes);
router.use("/appointments", appointmentsRoutes);
router.use("/admin", adminRoutes);

export default router;
