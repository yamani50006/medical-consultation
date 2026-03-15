import { z } from "zod";
import { CHAT_DEFAULT_PAGE_SIZE, CHAT_MAX_MESSAGE_LENGTH, CHAT_MAX_SEARCH_LENGTH } from "./chat.constants.js";
import { CHAT_ATTACHMENT_MAX_FILES } from "../uploads/uploads.constants.js";

const attachmentTokensSchema = z.array(z.string().min(20).max(2000)).max(CHAT_ATTACHMENT_MAX_FILES).optional();

export const createConversationSchema = z.object({
  consultationId: z.string().min(5).max(64)
});

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(CHAT_DEFAULT_PAGE_SIZE).optional(),
  search: z.string().trim().max(CHAT_MAX_SEARCH_LENGTH).optional()
});

export const conversationIdParamsSchema = z.object({
  id: z.string().min(5).max(64)
});

export const listMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(CHAT_DEFAULT_PAGE_SIZE).optional()
});

export const sendMessageSchema = z
  .object({
    body: z.string().max(CHAT_MAX_MESSAGE_LENGTH).optional(),
    attachmentTokens: attachmentTokensSchema
  })
  .refine(
    (payload) => Boolean((payload.body || "").trim()) || Boolean(payload.attachmentTokens?.length),
    {
      message: "Message body or attachment is required"
    }
  );

export const messageIdParamsSchema = z.object({
  id: z.string().min(5).max(64)
});
