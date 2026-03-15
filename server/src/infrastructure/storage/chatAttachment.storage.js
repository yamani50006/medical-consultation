import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import AppError from "../../core/errors/AppError.js";
import {
  CHAT_ATTACHMENT_ALLOWED_MIME_TYPES,
  CHAT_ATTACHMENT_MAX_SIZE_BYTES
} from "../../modules/uploads/uploads.constants.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const chatAttachmentDirectory = path.resolve(currentDirectory, "../../../storage/chat-attachments");

fs.mkdirSync(chatAttachmentDirectory, { recursive: true });

function sanitizeExtension(originalName = "") {
  const extension = path.extname(originalName || "").toLowerCase();
  return extension.replace(/[^a-z0-9.]/g, "");
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, chatAttachmentDirectory);
  },
  filename: (_req, file, callback) => {
    const extension = sanitizeExtension(file.originalname);
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

function fileFilter(_req, file, callback) {
  if (!CHAT_ATTACHMENT_ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(
      new AppError("Unsupported attachment type", 400, "UNSUPPORTED_ATTACHMENT_TYPE"),
      false
    );
    return;
  }

  callback(null, true);
}

export const chatAttachmentUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: CHAT_ATTACHMENT_MAX_SIZE_BYTES
  }
}).single("file");

export function buildStoredAttachmentPayload(file) {
  return {
    storageKey: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    fileExtension: sanitizeExtension(file.originalname) || null
  };
}

export function resolveChatAttachmentPath(storageKey) {
  return path.resolve(chatAttachmentDirectory, storageKey);
}

export function removeChatAttachment(storageKey) {
  const targetPath = resolveChatAttachmentPath(storageKey);

  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
}
