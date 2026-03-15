import ApiResponse from "../../core/base/ApiResponse.js";
import ChatService from "./chat.service.js";

class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  createConversation = async (req, res, next) => {
    try {
      const conversation = await this.chatService.createConversation(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Conversation created successfully",
        data: conversation
      });
    } catch (error) {
      return next(error);
    }
  };

  listConversations = async (req, res, next) => {
    try {
      const result = await this.chatService.listConversations(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "Conversations fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  getConversation = async (req, res, next) => {
    try {
      const conversation = await this.chatService.getConversation(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "Conversation fetched successfully",
        data: conversation
      });
    } catch (error) {
      return next(error);
    }
  };

  listMessages = async (req, res, next) => {
    try {
      const result = await this.chatService.listMessages(req.user.userId, req.params.id, req.query);
      return ApiResponse.success(res, {
        message: "Messages fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  sendMessage = async (req, res, next) => {
    try {
      const message = await this.chatService.sendMessage(req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Message sent successfully",
        data: message
      });
    } catch (error) {
      return next(error);
    }
  };

  markMessageSeen = async (req, res, next) => {
    try {
      const result = await this.chatService.markMessageSeen(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "Message marked as seen",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new ChatController();
