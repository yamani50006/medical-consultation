import ApiResponse from "../../core/base/ApiResponse.js";
import FollowUpsService from "./followUps.service.js";

class FollowUpsController {
  constructor() {
    this.followUpsService = new FollowUpsService();
  }

  createFollowUp = async (req, res, next) => {
    try {
      const result = await this.followUpsService.createFollowUp(
        req.user.userId,
        req.params.treatmentPlanId,
        req.body
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تم إرسال المتابعة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listMyFollowUps = async (req, res, next) => {
    try {
      const result = await this.followUpsService.listMyFollowUps(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب المتابعات بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listDoctorFollowUps = async (req, res, next) => {
    try {
      const result = await this.followUpsService.listDoctorFollowUps(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب متابعات الطبيب بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  addDoctorNote = async (req, res, next) => {
    try {
      const result = await this.followUpsService.addDoctorNote(req.user.userId, req.params.id, req.body);
      return ApiResponse.success(res, {
        message: "تمت إضافة الملاحظة المهنية بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new FollowUpsController();
