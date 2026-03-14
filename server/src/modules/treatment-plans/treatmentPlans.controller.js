import ApiResponse from "../../core/base/ApiResponse.js";
import TreatmentPlansService from "./treatmentPlans.service.js";

class TreatmentPlansController {
  constructor() {
    this.treatmentPlansService = new TreatmentPlansService();
  }

  createTreatmentPlan = async (req, res, next) => {
    try {
      const result = await this.treatmentPlansService.createTreatmentPlan(req.user.userId, req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "تم إنشاء الخطة العلاجية بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  listPatientTreatmentPlans = async (req, res, next) => {
    try {
      const result = await this.treatmentPlansService.listPatientTreatmentPlans(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب الخطط العلاجية بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  listDoctorTreatmentPlans = async (req, res, next) => {
    try {
      const result = await this.treatmentPlansService.listDoctorTreatmentPlans(req.user.userId, req.query);
      return ApiResponse.success(res, {
        message: "تم جلب الخطط العلاجية للطبيب بنجاح",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  getTreatmentPlanById = async (req, res, next) => {
    try {
      const result = await this.treatmentPlansService.getTreatmentPlanById(
        req.user.userId,
        req.user.role,
        req.params.id
      );
      return ApiResponse.success(res, {
        message: "تم جلب الخطة العلاجية بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateTreatmentPlan = async (req, res, next) => {
    try {
      const result = await this.treatmentPlansService.updateTreatmentPlan(
        req.user.userId,
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, {
        message: "تم تحديث الخطة العلاجية بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new TreatmentPlansController();
