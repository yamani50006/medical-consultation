import multer from "multer";
import { z } from "zod";
import AppError from "../../core/errors/AppError.js";
import { chatAttachmentUploadMiddleware } from "../../infrastructure/storage/chatAttachment.storage.js";

export const attachmentIdParamsSchema = z.object({
  id: z.string().min(5).max(64)
});

export function handleChatAttachmentUpload(req, res, next) {
  chatAttachmentUploadMiddleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Attachment exceeds the maximum allowed size", 400, "ATTACHMENT_TOO_LARGE"));
      return;
    }

    next(error);
  });
}
