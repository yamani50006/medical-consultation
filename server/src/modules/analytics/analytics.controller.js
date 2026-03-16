import ApiResponse from "../../core/base/ApiResponse.js";
import AnalyticsService from "./analytics.service.js";

class AnalyticsController {
  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getOverview = async (req, res, next) => {
    try {
      const result = await this.analyticsService.getOverview();
      return ApiResponse.success(res, {
        message: "Admin analytics overview fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  getDoctorPerformance = async (req, res, next) => {
    try {
      const result = await this.analyticsService.getDoctorPerformance(req.params.id);
      return ApiResponse.success(res, {
        message: "Doctor performance fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new AnalyticsController();
