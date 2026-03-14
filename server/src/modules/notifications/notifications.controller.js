import ApiResponse from "../../core/base/ApiResponse.js";
import NotificationsService from "./notifications.service.js";

class NotificationsController {
  constructor() {
    this.notificationsService = new NotificationsService();
  }

  listMyNotifications = async (req, res, next) => {
    try {
      const result = await this.notificationsService.listMyNotifications(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب الإشعارات بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  markAsRead = async (req, res, next) => {
    try {
      const result = await this.notificationsService.markAsRead(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        message: "تم تعليم الإشعار كمقروء",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  markAllAsRead = async (req, res, next) => {
    try {
      const result = await this.notificationsService.markAllAsRead(req.user.userId);
      return ApiResponse.success(res, {
        message: "تم تعليم الإشعارات كمقروءة",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new NotificationsController();
