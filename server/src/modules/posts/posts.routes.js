import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { roleMiddleware } from "../../core/middlewares/roleMiddleware.js";
import postsController from "./posts.controller.js";
import { createPostSchema, listPostsQuerySchema, updatePostSchema, validate } from "./posts.validator.js";

const router = Router();

router.get("/", validate(listPostsQuerySchema, "query"), postsController.listPublicPosts);
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(listPostsQuerySchema, "query"),
  postsController.listMyPosts
);
router.post("/", authMiddleware, roleMiddleware("DOCTOR"), validate(createPostSchema), postsController.createPost);
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  validate(updatePostSchema),
  postsController.updateOwnPost
);
router.delete("/:id", authMiddleware, roleMiddleware("DOCTOR"), postsController.deleteOwnPost);

export default router;
