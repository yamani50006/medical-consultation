import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import presenceController from "./presence.controller.js";
import { presenceParamsSchema } from "./presence.validator.js";

const router = Router();

router.get(
  "/:userId",
  authMiddleware,
  validateRequest(presenceParamsSchema, "params"),
  presenceController.getPresence
);

export default router;
