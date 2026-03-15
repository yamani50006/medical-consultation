import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import notificationsController from "./notifications.controller.js";
import { listNotificationsQuerySchema } from "./notifications.validator.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validateRequest(listNotificationsQuerySchema, "query"),
  notificationsController.listMyNotifications
);
router.get(
  "/me",
  authMiddleware,
  validateRequest(listNotificationsQuerySchema, "query"),
  notificationsController.listMyNotifications
);
router.patch("/read-all", authMiddleware, notificationsController.markAllAsRead);
router.patch("/me/read-all", authMiddleware, notificationsController.markAllAsRead);
router.patch("/:id/read", authMiddleware, notificationsController.markAsRead);

export default router;
