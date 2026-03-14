import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import usersController from "./users.controller.js";

const router = Router();

router.get("/me", authMiddleware, usersController.me);

export default router;
