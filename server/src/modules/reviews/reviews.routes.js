import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import reviewsController from "./reviews.controller.js";
import { createReviewSchema, listReviewsQuerySchema } from "./reviews.validator.js";

const router = Router();

router.get(
  "/public/doctor/:doctorId",
  validateRequest(listReviewsQuerySchema, "query"),
  reviewsController.listPublicDoctorReviews
);
router.get(
  "/eligible",
  authMiddleware,
  roleMiddleware("PATIENT"),
  reviewsController.listEligibleReviewTargets
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validateRequest(listReviewsQuerySchema, "query"),
  reviewsController.listMyReviews
);
router.get(
  "/doctor",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(listReviewsQuerySchema, "query"),
  reviewsController.listDoctorReviews
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("PATIENT"),
  validateRequest(createReviewSchema),
  reviewsController.createReview
);

export default router;
