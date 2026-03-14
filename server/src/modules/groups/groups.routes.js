import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import groupsController from "./groups.controller.js";
import {
  createGroupPostSchema,
  createGroupSchema,
  listGroupsQuerySchema,
  updateGroupPostSchema,
  updateGroupSchema
} from "./groups.validator.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("PATIENT", "DOCTOR", "ADMIN"),
  validateRequest(listGroupsQuerySchema, "query"),
  groupsController.listGroups
);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT", "DOCTOR", "ADMIN"),
  validateRequest(listGroupsQuerySchema, "query"),
  groupsController.listMyGroups
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(createGroupSchema),
  groupsController.createGroup
);
router.get("/:id", authMiddleware, roleMiddleware("PATIENT", "DOCTOR", "ADMIN"), groupsController.getGroupById);
router.post("/:id/join", authMiddleware, roleMiddleware("PATIENT"), groupsController.joinGroup);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(updateGroupSchema),
  groupsController.updateGroup
);
router.post(
  "/:id/posts",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(createGroupPostSchema),
  groupsController.createGroupPost
);
router.patch(
  "/posts/:postId",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validateRequest(updateGroupPostSchema),
  groupsController.updateGroupPost
);

export default router;
