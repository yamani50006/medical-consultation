import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import uploadsController from "./uploads.controller.js";
import { attachmentIdParamsSchema, handleChatAttachmentUpload } from "./uploads.validator.js";

const router = Router();

router.post("/chat-attachment", authMiddleware, handleChatAttachmentUpload, uploadsController.uploadChatAttachment);
router.get(
  "/chat-attachment/:id",
  authMiddleware,
  validateRequest(attachmentIdParamsSchema, "params"),
  uploadsController.downloadChatAttachment
);

export default router;
