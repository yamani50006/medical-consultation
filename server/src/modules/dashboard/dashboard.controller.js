import ApiResponse from "../../core/base/ApiResponse.js";
import DashboardService from "./dashboard.service.js";

class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getPatientDashboard = async (req, res, next) => {
    try {
      const result = await this.dashboardService.getPatientDashboard(req.user.userId);
      return ApiResponse.success(res, {
        message: "تم جلب لوحة تحكم المريض بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getDoctorDashboard = async (req, res, next) => {
    try {
      const result = await this.dashboardService.getDoctorDashboard(req.user.userId);
      return ApiResponse.success(res, {
        message: "تم جلب لوحة تحكم الطبيب بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getAdminDashboard = async (req, res, next) => {
    try {
      const result = await this.dashboardService.getAdminDashboard();
      return ApiResponse.success(res, {
        message: "تم جلب لوحة تحكم الإدارة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getAdminAnalytics = async (req, res, next) => {
    try {
      const result = await this.dashboardService.getAdminAnalytics();
      return ApiResponse.success(res, {
        message: "تم جلب تحليلات الإدارة بنجاح",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new DashboardController();
