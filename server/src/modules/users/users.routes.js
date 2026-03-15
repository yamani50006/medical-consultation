import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import usersController from "./users.controller.js";
import { updateCurrentUserSchema, validate } from "./users.validator.js";

const router = Router();

router.get("/me", authMiddleware, usersController.me);
router.patch("/me", authMiddleware, validate(updateCurrentUserSchema, "body"), usersController.updateMe);

export default router;
