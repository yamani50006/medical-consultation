import { Router } from "express";
import { authMiddleware } from "../../core/middlewares/authMiddleware.js";
import { validateRequest } from "../../core/middlewares/validateRequest.js";
import chatController from "./chat.controller.js";
import {
  conversationIdParamsSchema,
  createConversationSchema,
  listConversationsQuerySchema,
  listMessagesQuerySchema,
  messageIdParamsSchema,
  sendMessageSchema
} from "./chat.validator.js";

const router = Router();

router.post("/conversations", authMiddleware, validateRequest(createConversationSchema), chatController.createConversation);
router.get(
  "/conversations",
  authMiddleware,
  validateRequest(listConversationsQuerySchema, "query"),
  chatController.listConversations
);
router.get(
  "/conversations/:id",
  authMiddleware,
  validateRequest(conversationIdParamsSchema, "params"),
  chatController.getConversation
);
router.get(
  "/conversations/:id/messages",
  authMiddleware,
  validateRequest(conversationIdParamsSchema, "params"),
  validateRequest(listMessagesQuerySchema, "query"),
  chatController.listMessages
);
router.post(
  "/conversations/:id/messages",
  authMiddleware,
  validateRequest(conversationIdParamsSchema, "params"),
  validateRequest(sendMessageSchema),
  chatController.sendMessage
);
router.post(
  "/messages/:id/seen",
  authMiddleware,
  validateRequest(messageIdParamsSchema, "params"),
  chatController.markMessageSeen
);

export default router;
