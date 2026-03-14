import ApiResponse from "../../core/base/ApiResponse.js";
import PatientsService from "./patients.service.js";

class PatientsController {
  constructor() {
    this.patientsService = new PatientsService();
  }

  getMyProfile = async (req, res, next) => {
    try {
      const result = await this.patientsService.getMyProfile(req.user.userId);
      return ApiResponse.success(res, {
        message: "Patient profile fetched successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };

  updateMyProfile = async (req, res, next) => {
    try {
      const result = await this.patientsService.updateMyProfile(req.user.userId, req.body);
      return ApiResponse.success(res, {
        message: "Patient profile updated successfully",
        data: result
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default new PatientsController();
