import fs from "fs";
import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { assertRateLimit } from "../../core/utils/rateLimit.util.js";
import { signScopedToken, verifyScopedToken } from "../../core/utils/jwt.util.js";
import {
  buildStoredAttachmentPayload,
  resolveChatAttachmentPath
} from "../../infrastructure/storage/chatAttachment.storage.js";
import {
  CHAT_ATTACHMENT_MAX_FILES,
  CHAT_ATTACHMENT_RATE_LIMIT,
  CHAT_ATTACHMENT_UPLOAD_SCOPE
} from "./uploads.constants.js";
import UploadsRepository from "./uploads.repository.js";

export default class UploadsService extends BaseService {
  constructor() {
    super();
    this.uploadsRepository = new UploadsRepository();
  }

  uploadChatAttachment(userId, file) {
    this.ensure(file, "Attachment file is required", 400, "ATTACHMENT_REQUIRED");
    assertRateLimit(`upload:${userId}`, {
      ...CHAT_ATTACHMENT_RATE_LIMIT,
      message: "Upload rate limit exceeded",
      code: "UPLOAD_RATE_LIMIT_EXCEEDED"
    });

    const storedAttachment = buildStoredAttachmentPayload(file);
    const token = signScopedToken(
      CHAT_ATTACHMENT_UPLOAD_SCOPE,
      {
        userId,
        ...storedAttachment
      },
      { expiresIn: "15m" }
    );

    return {
      token,
      attachment: {
        ...storedAttachment,
        isImage: storedAttachment.mimeType.startsWith("image/")
      }
    };
  }

  resolveChatAttachmentTokens(userId, tokens = []) {
    this.ensure(tokens.length <= CHAT_ATTACHMENT_MAX_FILES, "Too many attachments", 400, "TOO_MANY_ATTACHMENTS");

    const seenKeys = new Set();

    return tokens.map((token) => {
      const payload = verifyScopedToken(token, CHAT_ATTACHMENT_UPLOAD_SCOPE);
      this.ensure(payload.userId === userId, "Invalid upload token", 403, "UPLOAD_TOKEN_FORBIDDEN");
      this.ensure(!seenKeys.has(payload.storageKey), "Duplicate attachment token", 400, "DUPLICATE_ATTACHMENT");
      seenKeys.add(payload.storageKey);

      return {
        storageKey: payload.storageKey,
        originalName: payload.originalName,
        mimeType: payload.mimeType,
        sizeBytes: payload.sizeBytes,
        fileExtension: payload.fileExtension || null
      };
    });
  }

  async getAttachmentDownload(userId, attachmentId) {
    const attachment = this.ensureFound(
      await this.uploadsRepository.findAttachmentById(attachmentId),
      "Attachment not found",
      "ATTACHMENT_NOT_FOUND"
    );

    const isAuthorized = attachment.message.conversation.participants.some(
      (participant) => participant.userId === userId
    );

    this.ensure(isAuthorized, "You cannot access this attachment", 403, "ATTACHMENT_FORBIDDEN");

    const filePath = resolveChatAttachmentPath(attachment.storageKey);
    this.ensure(fs.existsSync(filePath), "Attachment file not found", 404, "ATTACHMENT_FILE_NOT_FOUND");

    return {
      filePath,
      fileName: attachment.originalName,
      mimeType: attachment.mimeType
    };
  }
}
