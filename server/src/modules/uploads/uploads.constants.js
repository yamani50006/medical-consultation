export const CHAT_ATTACHMENT_UPLOAD_SCOPE = "chat-attachment-upload";

export const CHAT_ATTACHMENT_MAX_FILES = 5;
export const CHAT_ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const CHAT_ATTACHMENT_RATE_LIMIT = {
  limit: 20,
  windowMs: 60 * 1000
};

export const MESSAGE_RATE_LIMIT = {
  limit: 40,
  windowMs: 60 * 1000
};

export const CHAT_ATTACHMENT_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export function isImageMimeType(mimeType) {
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}
