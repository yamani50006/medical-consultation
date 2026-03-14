import ApiResponse from "../../core/base/ApiResponse.js";
import GroupsService from "./groups.service.js";

class GroupsController {
  constructor() {
    this.groupsService = new GroupsService();
  }

  createGroup = async (req, res, next) => {
    try {
      const result = await this.groupsService.createGroup(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تم إنشاء المجموعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listGroups = async (req, res, next) => {
    try {
      const result = await this.groupsService.listGroups(req.user.userId, req.user.role, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب المجموعات بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listMyGroups = async (req, res, next) => {
    try {
      const result = await this.groupsService.listMyGroups(req.user.userId, req.user.role, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب مجموعاتي بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  getGroupById = async (req, res, next) => {
    try {
      const result = await this.groupsService.getGroupById(req.user.userId, req.user.role, req.params.id);
      return ApiResponse.success(res, {
        message: "تم جلب المجموعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  joinGroup = async (req, res, next) => {
    try {
      const result = await this.groupsService.joinGroup(req.user.userId, req.params.id);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تم الانضمام إلى المجموعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateGroup = async (req, res, next) => {
    try {
      const result = await this.groupsService.updateGroup(req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, {
        message: "تم تحديث المجموعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  createGroupPost = async (req, res, next) => {
    try {
      const result = await this.groupsService.createGroupPost(req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تم إنشاء منشور المجموعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateGroupPost = async (req, res, next) => {
    try {
      const result = await this.groupsService.updateGroupPost(req.user.userId, req.params.postId, req.body);
      return ApiResponse.success(res, {
        message: "تم تحديث منشور المجموعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new GroupsController();
