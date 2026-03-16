import ApiResponse from "../../core/base/ApiResponse.js";
import AlertsService from "./alerts.service.js";

class AlertsController {
  constructor() {
    this.alertsService = new AlertsService();
  }

  listAlerts = async (req, res, next) => {
    try {
      const result = await this.alertsService.listAlerts(req.query);
      return ApiResponse.success(res, {
        message: "Admin alerts fetched successfully",
        data: result.items,
        meta: result.meta
      });
    } catch (error) {
      return next(error);
    }
  };

  updateAlertStatus = async (req, res, next) => {
    try {
      const result = await this.alertsService.updateAlertStatus(req.params.id, req.body.status, req.user.userId);
      return ApiResponse.success(res, {
        message: "Alert status updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new AlertsController();
